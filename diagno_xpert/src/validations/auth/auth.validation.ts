import DbConnection from "@/lib/DatabaseConnect";
import User from "@/models/user.models";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helper/NodeMAiler";
import { resetPasswordEmailTemplate } from "@/helper/EmailTemplate/ForgetPasswordt";
import { ImageHandeler } from "@/helper/CaloudinarSetup";


export async function createUser(data: any) {
  await DbConnection();

  const { username, email, password, role, dateOfBirth, phoneNumber } = data.values;
  if (!username || !email || !password || !role || !dateOfBirth || !phoneNumber) {
    throw new Error("Missing required fields.");
  }

  if (!["patient", "doctor", "admin"].includes(role)) {
    throw new Error("Invalid role specified.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (phoneNumber && !/^\+?[1-9]\d{9,14}$/.test(phoneNumber)) {
    throw new Error("Invalid phone number format. Must be 10–15 digits.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    dateOfBirth,
    phoneNumber,
    twoFactorEnabled: false,
    profilePicture: "/default-avatar.svg",
  });

  await newUser.save();
  return newUser;
}

export async function updateUserPassword(data: any) {
  await DbConnection();

  const { userId, password, conformPassword } = data.values;
  if (!userId || !password || !conformPassword) {
    throw new Error("User ID, password and confirm password are required.");
  }

  if (password !== conformPassword) {
    throw new Error("Password and confirm password do not match.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },
    { password: hashedPassword },
    { new: true }
  );
  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
}

export async function getUserByEmail(email: string) {
  await DbConnection();
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetLink = `${process.env.ForgetPasswordEmailTemplate}/${user._id}`;

  await sendEmail(email, resetPasswordEmailTemplate(user.username, resetLink),"Password reset requested",);

  return user;
}

export async function getUserById(id: string) {
  await DbConnection();
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function updateUser(id: string, data: any,file: any) {
  await DbConnection();

  const existingUser: any = await User.findById(id);
  if (!existingUser) {
    throw new Error("User not found");
  }

  await ImageHandeler({ user: existingUser, file, data });

  const user = await User.findByIdAndUpdate(id, data, { new: true });

  return user;
}