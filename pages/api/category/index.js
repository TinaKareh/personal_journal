import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let user;
  try {
    user = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = user.id;

  switch (req.method) {
    //Get all categories for the user
    case 'GET': {
      try {
        const categories = await prisma.category.findMany({
          where: { userId },
          orderBy: { name: 'asc' },
        });

        return res.status(200).json(categories);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching categories' });
      }
    }

    //  Create new category
    case 'POST': {
      const { name, color, deletionStatus = 'NOT_DELETED' } = req.body;

      if (!name || !color) {
        return res.status(400).json({ error: 'Name and color are required' });
      }

      try {
        const category = await prisma.category.create({
          data: {
            name,
            color,
            deletionStatus,
            userId,
          },
        });

        return res.status(201).json(category);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating category' });
      }
    }

    // Update a category
    case 'PUT': {
      const { id, name, color, deletionStatus } = req.body;

      if (!id) return res.status(400).json({ error: 'Category ID is required' });

      try {
        const updated = await prisma.category.updateMany({
          where: { id: parseInt(id), userId },
          data: { name, color, deletionStatus },
        });

        return res.status(200).json({ success: true, updated });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating category' });
      }
    }

    //Delete a category by ID
    case 'DELETE': {
      const { id } = req.query;

      if (!id) return res.status(400).json({ error: 'Category ID is required' });

      try {
        const deleted = await prisma.category.deleteMany({
          where: { id: parseInt(id), userId },
        });

        return res.status(200).json({ success: true, deleted });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting category' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
