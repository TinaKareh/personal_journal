/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log the user out
 *     description: Clears the JWT token cookie, effectively logging the user out of the application.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out, token cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Logged out successfully"
 *       500:
 *         description: Internal server error
 *     security:
 *       - BearerAuth: []
 *
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default async function handler(req, res) {
  // Clear any cookies or session logic here
  res.setHeader("Set-Cookie", [
    `token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
  ]);

  return res.status(200).json({ message: "Logged out successfully" });
}
