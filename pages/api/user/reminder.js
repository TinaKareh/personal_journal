import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const formatReminderTypeForFrontend = (type) => {
  if (!type) return "";
  return (
    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace("_", " ")
  );
};

const parseReminderTypeFromFrontend = (type) => {
  if (!type) return null;
  const formattedType = type.toUpperCase().replace(" ", "_");
  if (["GENTLE", "PASSIVE_AGGRESSIVE", "NONCHALANT"].includes(formattedType)) {
    return formattedType;
  }
  return null;
};

const formatTimeForFrontend = (time) => {
  if (!time) return "";

  const date = new Date(time);
  const options = { hour: "numeric", minute: "numeric", hour12: true };
  return date.toLocaleTimeString("en-US", options);
};

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
    // Fetch user reminders
    case "GET": {
      try {
        const reminders = await prisma.reminder.findMany({
          where: { userId },
          orderBy: { time: "asc" },
        });

        // Parse the reminder fields before returning the data
        const formattedReminders = reminders.map((reminder) => ({
          ...reminder,
          type: formatReminderTypeForFrontend(reminder.type), // Format reminder type
          time: formatTimeForFrontend(reminder.time), // Format time to AM/PM
        }));

        return res.status(200).json(formattedReminders);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch reminders" });
      }
    }

    // Add new reminder
    case "POST": {
      const { type, time, days, deletionStatus = "NOT_DELETED" } = req.body;

      if (!type || !time || !days || days.length === 0) {
        return res
          .status(400)
          .json({ error: "Type, time, and days are required" });
      }

      const parsedType = parseReminderTypeFromFrontend(type);
      console.log("Parsed type:", parsedType);

      try {
        // Loop through the days and create a reminder for each selected day
        const reminders = await Promise.all(
          days.map(async (day) => {
            const reminder = await prisma.reminder.create({
              data: {
                type: parsedType, // Ensure the parsed type matches the ReminderType enum
                time: new Date(`1970-01-01T${time}`), // Normalize time string to Date object
                day,
                userId,
                deletionStatus, // 'NOT_DELETED' or 'DELETED'
              },
            });
            return reminder;
          })
        );

        // Parse the reminder fields before returning the data
        const formattedReminders = reminders.map((reminder) => ({
          ...reminder,
          type: formatReminderTypeForFrontend(reminder.type), // Format reminder type
          time: formatTimeForFrontend(reminder.time), // Format time to AM/PM
        }));

        return res.status(201).json(formattedReminders);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create reminder" });
      }
    }

    //Update reminder
    case "PUT": {
      const { ids, type, time, days, deletionStatus = "NOT_DELETED" } = req.body;
    
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "List of IDs is required" });
      }
      if (!days || !Array.isArray(days) || days.length === 0) {
        return res.status(400).json({ error: "List of days is required" });
      }
    
      const parsedType = parseReminderTypeFromFrontend(type);
    
      try {
        // Case 1: If the number of days is equal to the number of ids
        if (days.length === ids.length) {
          const updatePromises = ids.map((id, index) => {
            return prisma.reminder.update({
              where: { id },
              data: {
                type: parsedType,
                time: new Date(`1970-01-01T${time}`),
                day: days[index], // Assign each day to the corresponding ID
                deletionStatus,
              },
            });
          });
    
          await Promise.all(updatePromises); // Update all reminders
          return res.status(200).json({ success: true, message: "Reminders updated" });
    
        } 
        // Case 2: If the number of days is less than the number of ids
        else if (days.length < ids.length) {
          const updatePromises = days.map((day, index) => {
            return prisma.reminder.update({
              where: { id: ids[index] },
              data: {
                type: parsedType,
                time: new Date(`1970-01-01T${time}`),
                day,
                deletionStatus,
              },
            });
          });
    
          const deleteIds = ids.slice(days.length); // Delete extra reminders
          await Promise.all(updatePromises); // Update the remaining reminders
          await prisma.reminder.deleteMany({
            where: { id: { in: deleteIds } },
          });
    
          return res.status(200).json({ success: true, message: "Reminders updated and extra ones deleted" });
        } 
        // Case 3: If the number of days is more than the number of ids
        else {
          const updatePromises = ids.map((id, index) => {
            return prisma.reminder.update({
              where: { id },
              data: {
                type: parsedType,
                time: new Date(`1970-01-01T${time}`),
                day: days[index], // Assign the first days to the existing ids
                deletionStatus,
              },
            });
          });
    
          await Promise.all(updatePromises); // Update the existing reminders
    
          // Create new reminders for the remaining days
          const newDays = days.slice(ids.length); // Get the remaining days
          const createPromises = newDays.map((day) => {
            return prisma.reminder.create({
              data: {
                type: parsedType,
                time: new Date(`1970-01-01T${time}`),
                day,
                userId, // Use the current user ID
                deletionStatus,
              },
            });
          });
    
          await Promise.all(createPromises); // Create new reminders
          return res.status(200).json({ success: true, message: "Reminders updated and new ones created" });
        }
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update reminders" });
      }
    }
    

    // Delete reminders
    case "DELETE": {
      const { ids } = req.body; // Get the array of ids from the request body

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "List of IDs is required" });
      }

      try {
        // Use Prisma to delete reminders by matching ids
        const deleted = await prisma.reminder.deleteMany({
          where: {
            id: {
              in: ids, // Delete all reminders whose ID is in the provided list of IDs
            },
          },
        });

        return res.status(200).json({ success: true, deleted });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete reminders" });
      }
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
