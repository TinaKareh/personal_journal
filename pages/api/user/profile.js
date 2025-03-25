/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     description: Fetches the profile of the authenticated user, including their personal details such as name, email, gender, and date of birth.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the user
 *                   example: 1
 *                 firstName:
 *                   type: string
 *                   description: The user's first name
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   description: The user's last name
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   description: The user's email address
 *                   example: "john.doe@example.com"
 *                 role:
 *                   type: string
 *                   description: The role of the user (e.g., "USER", "ADMIN")
 *                   example: "USER"
 *                 gender:
 *                   type: string
 *                   description: The user's gender (e.g., "Male", "Female", "Other")
 *                   example: "Male"
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                   description: The user's date of birth
 *                   example: "1990-05-15"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date when the user was created
 *                   example: "2022-01-01T12:00:00Z"
 *       401:
 *         description: Unauthorized access (missing or invalid JWT token)
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: Updates the user's profile information such as name, gender, and date of birth.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The user's last name
 *                 example: "Doe"
 *               gender:
 *                 type: string
 *                 description: The user's gender (should be "Male", "Female", or "Other")
 *                 example: "Male"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: The user's date of birth
 *                 example: "1990-05-15"
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the user
 *                   example: 1
 *                 firstName:
 *                   type: string
 *                   description: The user's first name
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   description: The user's last name
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   description: The user's email address
 *                   example: "john.doe@example.com"
 *                 gender:
 *                   type: string
 *                   description: The user's gender (e.g., "Male", "Female", "Other")
 *                   example: "Male"
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                   description: The user's date of birth
 *                   example: "1990-05-15"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date when the user was updated
 *                   example: "2022-01-01T12:00:00Z"
 *       400:
 *         description: Missing required fields or invalid gender
 *       401:
 *         description: Unauthorized access (missing or invalid JWT token)
 *       500:
 *         description: Internal server error
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

const formatGenderForFrontend = (gender) => {
  if (!gender) return "";
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(); 
};

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
    // GET user profile
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

    // UPDATE user profile
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
