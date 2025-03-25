/**
 * @swagger
 * /api/journal/date:
 *   get:
 *     summary: Get all journal entry dates
 *     description: Fetches all journal entry dates from the database, formatted as `YYYY-MM-DD`.
 *     tags: [Journal]
 *     responses:
 *       200:
 *         description: A list of all journal entry dates in `YYYY-MM-DD` format
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 format: date
 *                 description: A journal entry date in `YYYY-MM-DD` format.
 *                 example: "2025-03-02"
 *       500:
 *         description: Internal server error if something goes wrong fetching journal entries
 *       405:
 *         description: Method Not Allowed if the request method is not GET
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const journalEntries = await prisma.journalEntry.findMany({
        select: {
          createdAt: true,
        },
      });

      const formattedDates = journalEntries.map(
        (entry) => entry.createdAt.toISOString().split("T")[0]
      );
      const distinctDates = [...new Set(formattedDates)];

      return res.status(200).json(distinctDates);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      return res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
