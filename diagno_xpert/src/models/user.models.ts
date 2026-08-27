import mongoose, { Schema } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: "patient" | "doctor" | "admin";
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  dateOfBirth?: Date;
  oauth?: boolean;
  profilePicture?: string;
  gender?: string;
  age?: number;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    oauth: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: function (this: IUser): boolean {
        return !this.oauth;
      },
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    profilePicture: {
      Url: {
        type: String,
        default: "/default-avatar.svg",
      },
      Location: {
        type: String,
        default: "",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
});

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
