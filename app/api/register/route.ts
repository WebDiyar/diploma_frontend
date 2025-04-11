import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json(
      { user: safeUser, message: "Account created successfully." },
      { status: 201 },
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 },
    );
  }
}
