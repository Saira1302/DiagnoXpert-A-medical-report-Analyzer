import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/validations/auth/auth.validation";
import User from "@/models/user.models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    return NextResponse.json(
      { message: "User fetched successfully", user },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("profilePicture") as File;
     const data: any = {
      username: formData.get("username"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      gender: formData.get("gender"),
      age: formData.get("age"),
      role: formData.get("role"),
      dateOfBirth: formData.get("dateOfBirth"),
    };

    const user = await updateUser(id, data,file);
    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 },
    );
  }
}
