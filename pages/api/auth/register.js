/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Registers a new user by creating an account with the provided details.
 *     tags: [Auth]
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
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 description: The role of the user, defaults to "USER"
 *                 example: "USER"
 *               gender:
 *                 type: string
 *                 description: The user's gender, defaults to "OTHER"
 *                 example: "MALE"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: The user's date of birth, defaults to "1970-01-01"
 *                 example: "1990-05-15"
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *       400:
 *         description: Missing required fields (firstName, lastName, email, password)
 *       409:
 *         description: Conflict - Email is already registered
 *       500:
 *         description: Internal server error
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    role = "USER",
    gender = "OTHER",
    dateOfBirth = "1970-01-01",
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error:
          "Oops.it seems like that email has already been registered on our platform.Log in",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build the data object dynamically
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      gender,
      dateOfBirth: new Date(dateOfBirth),
    };

    const user = await prisma.user.create({
      data: userData,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
