import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let user;
  try {
    user = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = user.id;

  try {
    // Get all categories that are either user-owned or default
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: userId },
          { userId: null }, // default categories
        ],
      },
      orderBy: { name: 'asc' },
    });

    // For each category, count the journal entries linked to it by the current user
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const entryCount = await prisma.journalEntry.count({
          where: {
            categoryId: category.id,
            userId: userId, // only count entries belonging to this user
          },
        });

        return {
          ...category,
          entryCount,
        };
      })
    );

    return res.status(200).json(categoriesWithCount);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load categories with entry counts' });
  }
}
