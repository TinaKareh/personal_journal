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
    // Get user + default categories that are NOT deleted
    const categories = await prisma.category.findMany({
      where: {
        deletionStatus: 'NOT_DELETED',
        OR: [
          { userId: userId },
          { userId: null }, // Default categories
        ],
      },
      orderBy: { name: 'asc' },
    });

    // Attach journal entry count per category for this user
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.journalEntry.count({
          where: {
            categoryId: category.id,
            userId: userId, // Only this user's entries
          },
        });

        return {
          id: category.id,
          name: category.name,
          color: category.color,
          userId: category.userId,
          deletionStatus: category.deletionStatus,
          count: count ?? 0,
        };
      })
    );

    return res.status(200).json(categoriesWithCount);
  } catch (err) {
    console.error('❌ Failed to load categories with entry counts:', err);
    return res.status(500).json({ error: 'Failed to load categories with entry counts' });
  }
}
