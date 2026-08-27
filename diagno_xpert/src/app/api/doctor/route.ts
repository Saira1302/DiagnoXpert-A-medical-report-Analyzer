import { NextRequest, NextResponse } from "next/server";
import { getDoctors } from "@/validations/auth/doctor.validation";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const speciality = searchParams.get("speciality")?.trim() || "";
		const gender = searchParams.get("gender")?.trim() || "";
		const page = Number(searchParams.get("page") || "1");
		const limit = Number(searchParams.get("limit") || "10");

		const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
		const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
		const skip = (safePage - 1) * safeLimit;

		const doctors = await getDoctors(skip, safeLimit, speciality, gender);
		return NextResponse.json({ message: "Doctors fetched successfully", doctors }, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: "Failed to fetch doctors", error: error.message }, { status: 500 });
	}
}
