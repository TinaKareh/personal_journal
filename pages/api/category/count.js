/**
 * @swagger
 * /api/category/count:
 *   get:
 *     summary: Get all categories with entry counts for the authenticated user
 *     description: Retrieves all categories (user-specific and default) that are not deleted and includes the count of journal entries per category for the authenticated user.
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: A list of categories with their journal entry counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique identifier of the category
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the category
 *                     example: "Work"
 *                   color:
 *                     type: string
 *                     description: The color associated with the category
 *                     example: "#FF5733"
 *                   userId:
 *                     type: integer
 *                     description: The user ID associated with the category (null for default categories)
 *                     example: 1
 *                   deletionStatus:
 *                     type: string
 *                     description: The deletion status of the category (e.g., "NOT_DELETED")
 *                     example: "NOT_DELETED"
 *                   count:
 *                     type: integer
 *                     description: The number of journal entries in this category for the authenticated user
 *                     example: 5
 *       401:
 *         description: Unauthorized access (missing or invalid JWT token)
 *       500:
 *         description: Internal server error
 *       405:
 *         description: Method not allowed (if the method is not GET)
 *
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
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let user;
  try {
    user = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = user.id;

  try {
    // Get user + default categories that are NOT deleted
    const categories = await prisma.category.findMany({
      where: {
        deletionStatus: "NOT_DELETED",
        OR: [
          { userId: userId },
          { userId: null }, // Default categories
        ],
      },
      orderBy: { name: "asc" },
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
    console.error("Failed to load categories with entry counts:", err);
    return res
      .status(500)
      .json({ error: "Failed to load categories with entry counts" });
  }
}
