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
    // Fetch user reminders
    case 'GET': {
      try {
        const reminders = await prisma.reminder.findMany({
          where: { userId },
          orderBy: { time: 'asc' },
        });
        return res.status(200).json(reminders);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch reminders' });
      }
    }

    // Add a reminder
    case 'POST': {
      const { type, time, day, deletionStatus = 'NOT_DELETED' } = req.body;

      if (!type || !time || !day) {
        return res.status(400).json({ error: 'Type, time, and day are required' });
      }

      try {
        const reminder = await prisma.reminder.create({
          data: {
            type,
            time: new Date(time),
            day,
            userId,
            deletionStatus,
          },
        });

        return res.status(201).json(reminder);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create reminder' });
      }
    }

    // Update a reminder
    case 'PUT': {
      const { id, type, time, day, deletionStatus } = req.body;

      if (!id) return res.status(400).json({ error: 'Reminder ID is required' });

      try {
        const updated = await prisma.reminder.updateMany({
          where: { id: parseInt(id), userId },
          data: {
            ...(type && { type }),
            ...(time && { time: new Date(time) }),
            ...(day && { day }),
            ...(deletionStatus && { deletionStatus }),
          },
        });

        return res.status(200).json({ success: true, updated });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update reminder' });
      }
    }

    // Remove reminder
    case 'DELETE': {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Reminder ID is required' });

      try {
        const deleted = await prisma.reminder.deleteMany({
          where: { id: parseInt(id), userId },
        });

        return res.status(200).json({ success: true, deleted });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete reminder' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
