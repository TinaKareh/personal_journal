/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories for the authenticated user
 *     description: Retrieve a list of categories for the authenticated user, including default categories and user-specific ones.
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: A list of categories for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   color:
 *                     type: string
 *                   deletionStatus:
 *                     type: string
 *                   userId:
 *                     type: integer
 *       401:
 *         description: Unauthorized access (missing or invalid JWT token)
 *       500:
 *         description: Error fetching categories
 *   
 *   post:
 *     summary: Create a new category
 *     description: Create a new category for the authenticated user.
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               deletionStatus:
 *                 type: string
 *                 default: "NOT_DELETED"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 color:
 *                   type: string
 *                 deletionStatus:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Missing required fields (name or color)
 *       500:
 *         description: Error creating category
 *   
 *   put:
 *     summary: Update an existing category
 *     description: Update the name, color, or deletion status of an existing category.
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               deletionStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 updated:
 *                   type: integer
 *                   description: Number of categories updated
 *       400:
 *         description: Category ID is required or invalid input
 *       500:
 *         description: Error updating category
 *   
 *   delete:
 *     summary: Delete a category
 *     description: Delete a category by its ID.
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: id
 *         description: The ID of the category to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deleted:
 *                   type: integer
 *                   description: Number of categories deleted
 *       400:
 *         description: Category ID is required
 *       500:
 *         description: Error deleting category
 *   
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

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
  console.log("Decoded user:", user);


  const userId = user.id;

  switch (req.method) {
    //Get all categories for the user
    case 'GET': {
      try {
        const categories = await prisma.category.findMany({
          where: {
            deletionStatus: 'NOT_DELETED',
            OR: [
              { userId: userId },   // User-specific categories
              { userId: null },     // Default categories
            ],
          },
          orderBy: { name: 'asc' },
        });        

        return res.status(200).json(categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
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
