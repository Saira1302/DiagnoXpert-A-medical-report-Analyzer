import { createUser, updateUserPassword,getUserByEmail } from "@/validations/auth/auth.validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const user = await createUser(data);
    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: "Failed to create user", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const user = await updateUserPassword(data);
    return NextResponse.json({ message: "Password updated successfully", user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update password", error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    const user = await getUserByEmail(email);
    return NextResponse.json({ message: "User fetched successfully", user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch user", error: error.message }, { status: 500 });
  }
}
