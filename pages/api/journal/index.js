/**
 * @swagger
 * tags:
 *   name: Journal
 *   description: Journal entry management
 */

/**
 * @swagger
 * /api/journal:
 *   get:
 *     summary: Get a list of journal entries
 *     description: Retrieve a list of journal entries created on a specified date, with optional filters (categoryId, pagination).
 *     tags: [Journal]
 *     parameters:
 *       - in: query
 *         name: id
 *         description: The ID of the journal entry to retrieve
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoryId
 *         description: The category ID to filter journal entries by
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         description: The date to filter journal entries
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         description: The page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: The number of entries per page for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of journal entries created on the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   category:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Journal entry not found
 */

/**
 * @swagger
 * /api/journal:
 *   post:
 *     summary: Add a new journal entry
 *     description: Create a new journal entry for the authenticated user.
 *     tags: [Journal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Journal entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/journal:
 *   put:
 *     summary: Update an existing journal entry
 *     description: Update an existing journal entry with new data.
 *     tags: [Journal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Journal entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Journal entry not found
 */

/**
 * @swagger
 * /api/journal:
 *   delete:
 *     summary: Delete a journal entry
 *     description: Delete a journal entry by its ID.
 *     tags: [Journal]
 *     parameters:
 *       - in: query
 *         name: id
 *         description: The ID of the journal entry to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Journal entry deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Journal entry not found
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let user;
  try {
    user = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = user.id;

  switch (req.method) {
    // View entries (with optional filters: categoryId, dates, pagination)
    case "GET": {
      const { id, date, categoryId, page = 1, limit = 10 } = req.query;
    
      // If an ID is provided, return a single entry
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
    
      // Filter by exact date if 'date' parameter is provided
      let dateFilter = {};
      if (date) {
        // Parse the provided date into a Date object
        const targetDate = new Date(date);
    
        // Set the time to the start of the day (00:00:00) and end of the day (23:59:59)
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
        dateFilter = {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }
    
      //Return paginated list based on date and optional filters
      const entries = await prisma.journalEntry.findMany({
        where: {
          userId,
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...dateFilter, // Only apply the date filter if the date parameter is provided
        },
        include: {
          category: true,
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });
    
      return res.status(200).json(entries);
    }
    

    // Add a new entry
    case "POST": {
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

    // Update an existing entry
    case "PUT": {
      const { id, title, content, categoryId } = req.body;

      const updated = await prisma.journalEntry.update({
        where: { id: parseInt(id) },
        data: { title, content, categoryId },
        include: { category: true },
      });

      return res.status(200).json(updated);
    }

    // Delete an entry by ID
    case "DELETE": {
      const { id } = req.query;

      const deleted = await prisma.journalEntry.deleteMany({
        where: { id: parseInt(id), userId },
      });

      return res.status(200).json({ deleted });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
