import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DbConnection from "@/lib/DatabaseConnect";
import Notification from "@/models/notification.models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await DbConnection();

    const notifications = await Notification.find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: session.user._id,
      read: false,
    });

    return NextResponse.json(
      { notifications, unreadCount },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch notifications", error: error?.message },
      { status: 500 },
    );
  }
}

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await DbConnection();
    await Notification.updateMany(
      { userId: session.user._id, read: false },
      { $set: { read: true } },
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to mark notifications as read", error: error?.message },
      { status: 500 },
    );
  }
}
