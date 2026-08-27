"use client";

import DoctorApi from "@/ApiServices/doctorApi";
import HomeApi from "@/ApiServices/HomeApi";
import { useParams } from "next/navigation";
import { useEffect, useState, KeyboardEvent } from "react";
import toast from "react-hot-toast";
import {
    Save,
    Loader2,
    User,
    Briefcase,
    MapPin,
    Languages,
    Stethoscope,
    Calendar,
    FileText,
    X,
    Plus,
    DollarSign,
    GraduationCap,
    Clock,
    Phone,
    Mail,
    ArrowLeft,
    Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DoctorData {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
        profilePicture: { Url: string } | null;
        phoneNumber: string;
        gender: string | null;
        dateOfBirth: string | null;
    };
    speciality: string;
    experience: number;
    fee: number;
    city: string;
    qualification: string;
    about: string;
    languages: string[];
    conditions: string[];
    availableDays: string[];
    active: boolean;
    ratingAvg: number;
    reviews: string[];
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SPECIALITIES = [
   "child-specialist",
   "dentist",
   "eye-specialist",
   "gastroenterologist",
   "obesity-specialist",
   "orthopedic-surgeon",
   "psychiatrist",
   "skin-specialist",
];

function TagInput({
    tags,
    onAdd,
    onRemove,
    placeholder,
}: {
    tags: string[];
    onAdd: (tag: string) => void;
    onRemove: (index: number) => void;
    placeholder: string;
}) {
    const [input, setInput] = useState("");

    const addTag = () => {
        const value = input.trim();
        if (value && !tags.includes(value)) {
            onAdd(value);
        }
        setInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault();
            addTag();
        }
        if (e.key === "Backspace" && !input && tags.length > 0) {
            onRemove(tags.length - 1);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 w-full min-h-11 px-3 py-2 border border-gray-200 rounded-xl bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            {tags.map((tag, i) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-2.5 py-1 rounded-lg"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? placeholder : "Add more..."}
                className="flex-1 min-w-[120px] outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
            />
            {input.trim() && (
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addTag}
                    className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    + Add
                </button>
            )}
        </div>
    );
}

export default function DoctorProfilePage() {
    const { id } = useParams();
    const [doctor, setDoctor] = useState<DoctorData | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [speciality, setSpeciality] = useState("");
    const [qualification, setQualification] = useState("");
    const [experience, setExperience] = useState("");
    const [fee, setFee] = useState("");
    const [city, setCity] = useState("");
    const [about, setAbout] = useState("");
    const [languages, setLanguages] = useState<string[]>([]);
    const [conditions, setConditions] = useState<string[]>([]);
    const [availableDays, setAvailableDays] = useState<string[]>([]);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await DoctorApi.getDoctorProfileById(id as string);
                const d = res.doctor;
                setDoctor(d);
                const u = d.userId;
                setUsername(u.username || "");
                setEmail(u.email || "");
                setPhoneNumber(u.phoneNumber || "");
                setGender(u.gender || "");
                setDateOfBirth(
                    u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : ""
                );
                setSpeciality(d.speciality || "");
                setQualification(d.qualification || "");
                setExperience(d.experience ? String(d.experience) : "");
                setFee(d.fee ? String(d.fee) : "");
                setCity(d.city || "");
                setAbout(d.about || "");
                setLanguages(d.languages || []);
                setConditions(d.conditions || []);
                setAvailableDays(d.availableDays || []);
            } catch(err) {
                console.error(err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);
console.log(doctor);
    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                DoctorApi.updateDoctorProfile(id as string, {
                    speciality,
                    qualification,
                    experience: Number(experience) || 0,
                    fee: Number(fee) || 0,
                    city,
                    about,
                    languages,
                    conditions,
                    availableDays,
                }),
                (() => {
                    const formData = new FormData();
                    formData.append("username", username);
                    formData.append("email", email);
                    formData.append("phoneNumber", phoneNumber);
                    formData.append("role", "doctor");
                    if (gender) formData.append("gender", gender);
                    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
                    if (profileFile) formData.append("profilePicture", profileFile);
                    return HomeApi.updateUserProfile(doctor?.userId._id as string, formData);
                })(),
            ]);
            toast.success("Profile updated successfully!");
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: string) => {
        setAvailableDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Doctor profile not found.</p>
            </div>
        );
    }

    const user = doctor.userId;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="relative overflow-hidden">
                {/* Background with mesh gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-400/10 via-transparent to-transparent" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" suppressHydrationWarning style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-200/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
                            <img
                                src={previewUrl || user.profilePicture?.Url || "/default-avatar.svg"}
                                alt={user.username}
                                className="relative w-24 h-24 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20"
                            />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setProfileFile(file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </label>
                            {doctor.active && (
                                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-slate-900 shadow-lg" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {username || user.username}
                            </h1>
                            <p className="text-blue-200/80 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {email || user.email}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${
                                        doctor.active
                                            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                                            : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${doctor.active ? "bg-emerald-400" : "bg-amber-400"}`} />
                                    {doctor.active ? "Profile Active" : "Profile Incomplete"}
                                </span>
                                {speciality && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-blue-200 ring-1 ring-white/10 backdrop-blur-sm">
                                        <Stethoscope className="w-3 h-3" />
                                        {speciality.replace(/-/g, " ")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="sm:self-start sm:pt-1">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/10 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Personal Information */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-rose-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <User className="w-4 h-4 text-gray-400" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <Mail className="w-4 h-4 text-gray-400" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <Phone className="w-4 h-4 text-gray-400" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="e.g. +92 300 1234567"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <User className="w-4 h-4 text-gray-400" />
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Professional Information */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Professional Information</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <Stethoscope className="w-4 h-4 text-gray-400" />
                                Speciality
                            </label>
                            <select
                                value={speciality}
                                onChange={(e) => setSpeciality(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            >
                                <option value="">Select speciality</option>
                                {SPECIALITIES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                Qualification
                            </label>
                            <input
                                type="text"
                                value={qualification}
                                onChange={(e) => setQualification(e.target.value)}
                                placeholder="e.g. MBBS, FCPS"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <Clock className="w-4 h-4 text-gray-400" />
                                Experience (years)
                            </label>
                            <input
                                type="number"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                Consultation Fee (Rs.)
                            </label>
                            <input
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Location & Languages */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Location & Languages</h2>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                City
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Lahore"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                <Languages className="w-4 h-4 text-gray-400" />
                                Languages
                            </label>
                            <TagInput
                                tags={languages}
                                onAdd={(tag) => setLanguages((prev) => [...prev, tag])}
                                onRemove={(i) => setLanguages((prev) => prev.filter((_, idx) => idx !== i))}
                                placeholder="Type a language and press Enter"
                            />
                        </div>
                    </div>
                </section>

                {/* Conditions Treated */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Conditions Treated</h2>
                    </div>

                    <TagInput
                        tags={conditions}
                        onAdd={(tag) => setConditions((prev) => [...prev, tag])}
                        onRemove={(i) => setConditions((prev) => prev.filter((_, idx) => idx !== i))}
                        placeholder="Type a condition and press Enter"
                    />
                </section>

                {/* Availability */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Available Days</h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                            const isSelected = availableDays.includes(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                        isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* About */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">About</h2>
                    </div>

                    <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        rows={5}
                        placeholder="Write about yourself, your experience, and what makes you stand out..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    />
                </section>

                {/* Completion Status */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Profile Completion</h2>
                    </div>
                    <ProfileCompletionChecklist
                        speciality={speciality}
                        qualification={qualification}
                        experience={experience}
                        fee={fee}
                        city={city}
                        languages={languages}
                        conditions={conditions}
                        availableDays={availableDays}
                    />
                    <p className="text-xs text-gray-400 mt-3">
                        Complete all fields to activate your profile and appear in search results.
                    </p>
                </section>

                {/* Bottom Save */}
                <div className="flex justify-end pb-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProfileCompletionChecklist({
    speciality,
    qualification,
    experience,
    fee,
    city,
    languages,
    conditions,
    availableDays,
}: {
    speciality: string;
    qualification: string;
    experience: string;
    fee: string;
    city: string;
    languages: string[];
    conditions: string[];
    availableDays: string[];
}) {
    const items = [
        { label: "Speciality", done: !!speciality },
        { label: "Qualification", done: !!qualification },
        { label: "Experience", done: Number(experience) > 0 },
        { label: "Consultation Fee", done: Number(fee) > 0 },
        { label: "City", done: !!city },
        { label: "Languages", done: languages.length > 0 },
        { label: "Conditions", done: conditions.length > 0 },
        { label: "Available Days", done: availableDays.length > 0 },
    ];
    const completed = items.filter((i) => i.done).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                    {completed} / {items.length} completed
                </span>
                <span className="text-sm font-semibold text-blue-600">
                    {Math.round((completed / items.length) * 100)}%
                </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completed / items.length) * 100}%` }}
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                            item.done
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50 text-gray-400"
                        }`}
                    >
                        <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                item.done
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-400"
                            }`}
                        >
                            {item.done ? "✓" : ""}
                        </span>
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
