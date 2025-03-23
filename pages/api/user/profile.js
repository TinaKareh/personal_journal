import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper: convert DB enum (UPPERCASE) to readable string
const formatGenderForFrontend = (gender) => {
  if (!gender) return "";
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(); // e.g. MALE → Male
};

// Helper: convert frontend string (Title case) to enum value
const parseGenderFromFrontend = (gender) => {
  if (!gender) return null;
  const g = gender.toUpperCase();
  if (["MALE", "FEMALE", "OTHER"].includes(g)) {
    return g;
  }
  return null;
};

export default async function handler(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let userData;
  try {
    userData = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = userData.id;

  switch (req.method) {
    // 🔍 GET user profile
    case "GET": {
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

        return res.status(200).json({
          ...user,
          gender: formatGenderForFrontend(user.gender),
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch user profile" });
      }
    }

    // 📝 UPDATE user profile
    case "PUT": {
      const { firstName, lastName, gender, dateOfBirth } = req.body;

      const parsedGender = parseGenderFromFrontend(gender);

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(parsedGender && { gender: parsedGender }),
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

        return res.status(200).json({
          ...updatedUser,
          gender: formatGenderForFrontend(updatedUser.gender),
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update user" });
      }
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
