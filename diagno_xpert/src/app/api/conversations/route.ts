import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DbConnection from "@/lib/DatabaseConnect";
import Conversation from "@/models/conversation.models";
import User from "@/models/user.models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await DbConnection();

    const userId = new mongoose.Types.ObjectId(session.user._id);

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "participants",
        select: "username email profilePicture role",
      })
      .lean();

    const shaped = conversations.map((c: any) => {
      const peer = (c.participants || []).find(
        (p: any) => String(p._id) !== String(userId),
      );
      const unreadMap = c.unread || {};
      const unread =
        typeof unreadMap.get === "function"
          ? unreadMap.get(String(userId)) || 0
          : unreadMap[String(userId)] || 0;
      return {
        _id: c._id,
        peer,
        lastMessage: c.lastMessage || "",
        lastMessageAt: c.lastMessageAt,
        lastMessageSender: c.lastMessageSender,
        unread,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ conversations: shaped }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch conversations", error: error?.message },
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

    const { peerUserId } = await req.json();
    if (!peerUserId || typeof peerUserId !== "string") {
      return NextResponse.json(
        { message: "peerUserId is required" },
        { status: 400 },
      );
    }
    if (peerUserId === session.user._id) {
      return NextResponse.json(
        { message: "Cannot start a chat with yourself" },
        { status: 400 },
      );
    }

    await DbConnection();

    const peer = await User.findById(peerUserId).select(
      "_id username email profilePicture role",
    );
    if (!peer) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const me = new mongoose.Types.ObjectId(session.user._id);
    const peerId = new mongoose.Types.ObjectId(peerUserId);

    let convo = await Conversation.findOne({
      participants: { $all: [me, peerId], $size: 2 },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [me, peerId],
        unread: {},
      });
    }

    return NextResponse.json(
      {
        conversation: {
          _id: convo._id,
          peer: peer.toObject(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create conversation", error: error?.message },
      { status: 500 },
    );
  }
}
