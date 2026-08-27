import { NextResponse } from "next/server";
import DbConnection from "@/lib/DatabaseConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ModelChatHistory from "@/models/modelChatHistory.models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await DbConnection();

    const chats = await ModelChatHistory.find({ userId: session.user._id })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { message: "Failed to fetch chats", error: err?.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await DbConnection();

    let title = "New Chat";
    try {
      const body = await req.json();
      if (body?.title && typeof body.title === "string") {
        title = body.title.trim().slice(0, 80) || "New Chat";
      }
    } catch {
      // empty body is allowed
    }

    const chat = await ModelChatHistory.create({
      userId: session.user._id,
      title,
      messages: [],
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { message: "Failed to create chat", error: err?.message },
      { status: 500 },
    );
  }
}
