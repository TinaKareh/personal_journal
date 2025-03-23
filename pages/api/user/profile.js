import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let userData;
  try {
    userData = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = userData.id;

  switch (req.method) {
    // get user profile
    case 'GET': {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            gender: true,
            dateOfBirth: true,
            createdAt: true,
          },
        });

        return res.status(200).json(user);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }
    }

    // update profile details
    case 'PUT': {
      const { firstName, lastName, gender, dateOfBirth } = req.body;

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(gender && { gender }),
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            dateOfBirth: true,
            updatedAt: true,
          },
        });

        return res.status(200).json(updatedUser);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update user' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
