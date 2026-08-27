import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DbConnection from "@/lib/DatabaseConnect";
import Conversation from "@/models/conversation.models";
import Message from "@/models/message.models";
import Notification from "@/models/notification.models";
import User from "@/models/user.models";
import eventBus from "@/lib/eventBus";

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
    });
    if (!convo) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 },
      );
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    // Mark all peer messages as read for this user, reset unread counter.
    await Message.updateMany(
      { conversationId: id, senderId: { $ne: userId }, read: false },
      { $set: { read: true } },
    );
    convo.unread.set(String(userId), 0);
    await convo.save();

    // Tell the other side that the read state changed (so their unread badge can update if needed).
    const peer = (convo.participants as any[]).find(
      (p) => String(p) !== String(userId),
    );
    if (peer) {
      eventBus.publish(String(peer), {
        type: "read",
        conversationId: String(convo._id),
      });
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch messages", error: error?.message },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
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

    const { text } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { message: "Message text is required" },
        { status: 400 },
      );
    }
    const trimmed = text.trim().slice(0, 2000);

    await DbConnection();
    const userId = new mongoose.Types.ObjectId(session.user._id);

    const convo = await Conversation.findOne({
      _id: id,
      participants: userId,
    });
    if (!convo) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 },
      );
    }

    const message = await Message.create({
      conversationId: convo._id,
      senderId: userId,
      text: trimmed,
      read: false,
    });

    const peer = (convo.participants as any[]).find(
      (p) => String(p) !== String(userId),
    );
    const peerKey = String(peer);

    convo.lastMessage = trimmed;
    convo.lastMessageAt = new Date();
    convo.lastMessageSender = userId as any;
    const currentUnread = convo.unread.get(peerKey) || 0;
    convo.unread.set(peerKey, currentUnread + 1);
    await convo.save();

    // Build notification for the peer.
    const sender = await User.findById(userId).select(
      "username profilePicture role",
    );
    const senderName = sender?.username || "Someone";
    const link =
      sender?.role === "doctor"
        ? `/messages?c=${convo._id}`
        : `/doctors/messages?c=${convo._id}`;
    const notification = await Notification.create({
      userId: peer,
      fromUserId: userId,
      type: "message",
      title: `New message from ${senderName}`,
      body: trimmed.slice(0, 140),
      link,
      read: false,
      meta: { conversationId: String(convo._id) },
    });

    // Push real-time events.
    const messagePayload = {
      type: "message",
      conversationId: String(convo._id),
      message: {
        _id: String(message._id),
        conversationId: String(message.conversationId),
        senderId: String(message.senderId),
        text: message.text,
        read: message.read,
        createdAt: message.createdAt,
      },
    };
    eventBus.publish(peerKey, messagePayload);
    eventBus.publish(String(userId), messagePayload);

    eventBus.publish(peerKey, {
      type: "notification",
      notification: {
        _id: String(notification._id),
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt,
        meta: notification.meta,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to send message", error: error?.message },
      { status: 500 },
    );
  }
}
