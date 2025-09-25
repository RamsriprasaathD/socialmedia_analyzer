// src/app/api/login/route.js
import { NextResponse } from "next/server";
import { generateToken } from "../../lib/auth";

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  // ✅ Replace with your actual credentials
  if (email === "ramsriprasaath@gmail.com" && password === "12345") {
    const token = generateToken({ email });
    const response = NextResponse.json({ success: true });

    // ✅ Set JWT token in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return response;
  }

  return NextResponse.json(
    { success: false, message: "Invalid credentials! Try correct email/password." },
    { status: 401 }
  );
}
