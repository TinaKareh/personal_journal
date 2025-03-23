// pages/api/register.js

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
