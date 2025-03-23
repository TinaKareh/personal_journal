import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let userId = "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });

    if (entries.length === 0) {
      return res.status(200).json({ message: "No entries yet." });
    }

    // 1. Writing streak
    const dates = entries.map((e) => e.createdAt.toISOString().split("T")[0]);
    const uniqueDays = [...new Set(dates)].reverse();

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    // 2. Writing time range
    const hourBuckets = {};
    entries.forEach((e) => {
      const hour = new Date(e.createdAt).getHours();
      hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
    });

    const mostCommonHour = Object.entries(hourBuckets).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];
    const startHour = parseInt(mostCommonHour);
    const timeRange = `${formatHour(startHour)} - ${formatHour(startHour + 1)}`;

    // 3. Most used category (label)
    const labelCount = {};
    entries.forEach((e) => {
      const label = e.category?.name || "Uncategorized";
      labelCount[label] = (labelCount[label] || 0) + 1;
    });

    const mostUsedLabel = Object.entries(labelCount).reduce((a, b) =>
      a[1] > b[1] ? a : b
    );

    // 4. Word count average
    const wordCounts = entries.map((e) =>
      e.content.trim().split(/\s+/).length
    );
    const wordAvg = Math.round(
      wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    );

    return res.status(200).json({
      writingStreak: streak,
      idealWritingTime: timeRange,
      mostUsedLabel: {
        label: mostUsedLabel[0],
        count: mostUsedLabel[1],
      },
      wordCountAverage: wordAvg,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function formatHour(hour) {
  const hr = hour % 24;
  const period = hr >= 12 ? "PM" : "AM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}:00 ${period}`;
}
