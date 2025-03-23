// pages/api/auth/logout.js

export default async function handler(req, res) {
    // Clear any cookies or session logic here
    res.setHeader("Set-Cookie", [
      `token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    ]);
  
    return res.status(200).json({ message: "Logged out successfully" });
  }
  