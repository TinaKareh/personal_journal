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
    //view entries (with optional filters: categoryId, dates, pagination)
    case 'GET': {
      const { id, categoryId, startDate, endDate, page = 1, limit = 10 } = req.query;
    
      // ✅ If an ID is provided, return a single entry
      if (id) {
        const entry = await prisma.journalEntry.findFirst({
          where: {
            id: parseInt(id),
            userId,
          },
          include: {
            category: true,
          },
        });
    
        if (!entry) {
          return res.status(404).json({ error: "Entry not found" });
        }
    
        return res.status(200).json(entry);
      }
    
      // ✅ Otherwise return paginated list
      const entries = await prisma.journalEntry.findMany({
        where: {
          userId,
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(startDate && endDate && {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        },
        include: {
          category: true,
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      });
    
      return res.status(200).json(entries);
    }
    

    // Add a new entry
    case 'POST': {
      const { title, content, categoryId } = req.body;

      const newEntry = await prisma.journalEntry.create({
        data: {
          title,
          content,
          categoryId,
          userId,
        },
      });

      return res.status(201).json(newEntry);
    }

    //Update an existing entry
    case 'PUT': {
      const { id, title, content, categoryId } = req.body;

      const updated = await prisma.journalEntry.update({
        where: { id: parseInt(id) },
        data: { title, content, categoryId },
        include: { category: true },
      });      

      return res.status(200).json( updated );
    }

    // Delete an entry by ID
    case 'DELETE': {
      const { id } = req.query;

      const deleted = await prisma.journalEntry.deleteMany({
        where: { id: parseInt(id), userId },
      });

      return res.status(200).json({ deleted });
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
