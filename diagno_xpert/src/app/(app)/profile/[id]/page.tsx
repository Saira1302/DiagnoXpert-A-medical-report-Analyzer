"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

import HomeApi from "@/ApiServices/HomeApi";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const todayDate = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    username: session?.user?.username || "",
    email: session?.user?.email || "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    profilePicture: "" as string | File,
    role: "",
  });
  const [age, setAge] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateAgeFromDob = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
      return null;
    }

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge -= 1;
    }

    return calculatedAge;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const res = await HomeApi.getUserProfileById(id);
      const user = res.user;
      setFormData({
        username: user.username ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender ?? "",
        profilePicture:
          user.profilePicture.Url ?? session?.user?.profilePicture,
        role: user.role ?? session?.user?.role,
      });
    };
    fetchUserProfile();
  }, [id]);

  useEffect(() => {
    if (!formData.dateOfBirth) {
      setAge(null);
      return;
    }

    setAge(calculateAgeFromDob(formData.dateOfBirth));
  }, [formData.dateOfBirth]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("dateOfBirth", formData.dateOfBirth);
    data.append("gender", formData.gender);
    data.append("role", formData.role);
    if (formData.profilePicture instanceof File) {
      data.append("profilePicture", formData.profilePicture);
    }
    try {
      await HomeApi.updateUserProfile(id, data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <Link href="/home" aria-label="Back to Home" className="fixed top-10 ">
        <Button
          className="mb-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 hover:text-white text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
          variant="ghost"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
      </Link>
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 md:h-48 bg-linear-to-r from-blue-900  to-gray-900 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Profile Section */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {(previewUrl ||
                    (typeof formData.profilePicture === "string" &&
                      formData.profilePicture)) && (
                    <img
                      src={previewUrl || (formData.profilePicture as string)}
                      alt={session?.user?.username || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-blue-500  text-white p-2 rounded-full shadow-lg transition-all duration-200  group-hover:opacity-100"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                  {formData.username || "User"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {formData.email}
                </p>
                <div className="mt-3 flex items-center justify-center md:justify-start gap-2">
                  <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {session?.user?.role || "Patient"}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-4 md:mt-0">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="px-6 py-2 rounded-lg shadow-md"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Username
              </Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Phone Number
              </Label>
              <Input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Date of Birth
              </Label>
              <Input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                max={todayDate}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Gender
              </Label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Age (read-only, calculated from DOB) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Age
              </Label>
              <Input
                value={age !== null ? `${age} years` : "Set date of birth"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Account Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Account ID
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1 truncate">
                  {session?.user?._id}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Member Since
                </p>
                <p
                  className="text-lg font-semibold text-gray-800 dark:text-white mt-1"
                  suppressHydrationWarning
                >
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="bg-pink-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Session Expires
                </p>
                <p
                  className="text-lg font-semibold text-gray-800 dark:text-white mt-1"
                  suppressHydrationWarning
                >
                  {session?.expires
                    ? new Date(session.expires).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
