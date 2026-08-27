import { NextRequest, NextResponse } from "next/server";
import DbConnection from "@/lib/DatabaseConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ModelChatHistory, {
  ChatMessageRole,
  ChatMessageType,
} from "@/models/modelChatHistory.models";

type IncomingMessage = {
  role: ChatMessageRole;
  type: ChatMessageType;
  content?: string;
  fileName?: string;
  userQuestion?: string;
  result?: unknown;
};

function deriveTitle(msg: IncomingMessage): string | null {
  if (msg.type === "text" && msg.content) {
    return msg.content.trim().slice(0, 60);
  }
  if (msg.type === "scan") {
    if (msg.userQuestion) return msg.userQuestion.trim().slice(0, 60);
    if (msg.fileName) return msg.fileName.trim().slice(0, 60);
  }
  return null;
}

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
    await DbConnection();

    const chat = await ModelChatHistory.findOne({
      _id: id,
      userId: session.user._id,
    }).lean();

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { message: "Failed to fetch chat", error: err?.message },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await DbConnection();

    const chat = await ModelChatHistory.findOne({
      _id: id,
      userId: session.user._id,
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    if (typeof body?.title === "string" && body.title.trim()) {
      chat.title = body.title.trim().slice(0, 80);
    }

    let pushedAny = false;
    if (Array.isArray(body?.messages) && body.messages.length > 0) {
      const incoming = body.messages as IncomingMessage[];
      for (const m of incoming) {
        if (!m?.role || !m?.type) continue;
        chat.messages.push({
          role: m.role,
          type: m.type,
          content: m.content,
          fileName: m.fileName,
          userQuestion: m.userQuestion,
          result: m.result ?? null,
        });
        pushedAny = true;
      }

      if ((!chat.title || chat.title === "New Chat") && incoming.length > 0) {
        const firstUser = incoming.find((m) => m.role === "user");
        const generated = firstUser ? deriveTitle(firstUser) : null;
        if (generated) chat.title = generated;
      }
    }

    // Mixed fields nested in arrays don't always trigger change detection.
    if (pushedAny) chat.markModified("messages");

    await chat.save();

    return NextResponse.json({ chat }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { message: "Failed to update chat", error: err?.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await DbConnection();

    const result = await ModelChatHistory.findOneAndDelete({
      _id: id,
      userId: session.user._id,
    });

    if (!result) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted" }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { message: "Failed to delete chat", error: err?.message },
      { status: 500 },
    );
  }
}
