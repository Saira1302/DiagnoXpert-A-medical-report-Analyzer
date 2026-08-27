import { NextResponse } from "next/server";
import DbConnection from "@/lib/DatabaseConnect";
import User from "@/models/user.models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { role } = await req.json();
    if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });

    await DbConnection();

    await User.findByIdAndUpdate(session.user._id, { role });

    return NextResponse.json({ message: "Role saved", role });
}
