import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DbConnection from "@/lib/DatabaseConnect";
import Conversation from "@/models/conversation.models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    await DbConnection();
    const userId = new mongoose.Types.ObjectId(session.user._id);

    const convo = await Conversation.findOne({
      _id: id,
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "username email profilePicture role",
      })
      .lean<any>();

    if (!convo) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 },
      );
    }

    const peer = (convo.participants || []).find(
      (p: any) => String(p._id) !== String(userId),
    );

    return NextResponse.json(
      {
        conversation: {
          _id: convo._id,
          peer,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch conversation", error: error?.message },
      { status: 500 },
    );
  }
}
