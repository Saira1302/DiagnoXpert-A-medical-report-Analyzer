import Doctor from "@/models/doctor.models";
import mongoose from "mongoose";
import DbConnection from "@/lib/DatabaseConnect";
import User from "@/models/user.models";

export const GetDoctorById = async (userId: string) => {
  await DbConnection();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    const user=await User.findById(userId);
    
    if(user?.role !== "doctor") {
      throw new Error("User is not a doctor");
    }

    let doctor = await Doctor.findOne({ userId }).populate("userId");

    if (!doctor) {
      doctor = await Doctor.create({
        userId,
        speciality: "",
        experience: 0,
        fee: 0,
        city: "",
        languages: [],
        conditions: [],
        availableDays: [],
        qualification: "",
        about: "",
        ratingAvg: 0,
        reviews: [],
        active: false,
      });
    }

    return doctor
  } catch (error: any) {
    throw new Error(error.message || "Failed to get doctor by id");
  }
};

export const getDoctors = async (skip: number, limit: number, speciality: string, gender: string) => {
  await DbConnection();

  const filter: Record<string, string> = {};
  if (speciality) filter.speciality = speciality;

  let query = Doctor.find(filter).populate("userId").skip(skip);
  if (limit) query = query.limit(limit);

  let doctors = await query;
  if (gender) doctors = doctors.filter((doc: any) => doc.userId?.gender === gender);

  return doctors;
};

export const updateDoctor = async (id: string, data: any) => {
  await DbConnection();
  const doctor = await Doctor.findOneAndUpdate({userId:id}, data, { new: true });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const requiredFields = [
    "speciality", "fee", "experience", "city",
    "languages", "conditions", "availableDays", "qualification",
  ] as const;

  const isComplete = requiredFields.every((field) => {
    const val = doctor[field];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "number") return val > 0;
    return !!val;
  });

  if (isComplete !== doctor.active) {
    doctor.active = isComplete;
    await doctor.save();
  }

  return doctor;
};