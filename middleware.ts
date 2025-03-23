import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Convert string secret to Uint8Array
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  console.log("Token from cookie:", token);

  if (!token) {
    console.log("❌ No token found. Redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("✅ Token valid. Payload:", payload);
    return NextResponse.next();
  } catch (err) {
    console.error("❌ JWT Verify Error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/journal/:path*'],
};
