import { NextRequest, NextResponse } from "next/server";
import { GetDoctorById, getDoctors, updateDoctor } from "@/validations/auth/doctor.validation";

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (isObjectId(slug)) {
      const doctor = await GetDoctorById(slug);
      return NextResponse.json({ message: "Doctor fetched successfully", doctor }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender")?.trim() || "";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const skip = (safePage - 1) * safeLimit;

    const doctors = await getDoctors(skip, safeLimit, slug, gender);
    return NextResponse.json({ message: "Doctors fetched successfully", doctors }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch doctors", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await request.json();
    const doctor = await updateDoctor(slug, data);
    return NextResponse.json({ message: "Doctor updated successfully", doctor }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update doctor", error: error.message }, { status: 500 });
  }
}
