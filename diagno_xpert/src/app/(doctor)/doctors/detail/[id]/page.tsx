'use client';

import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Clock, User, Phone, Mail, Award, CheckCircle, ChevronLeft, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import doctorApi from '@/ApiServices/doctorApi';
import chatApi from '@/ApiServices/chatApi';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

type UserProfile = {
    _id: string;
    username: string;
    email: string;
    profilePicture?: {
        Url?: string;
        url?: string;
    };
    gender?: string;
};

type DoctorData = {
    _id: string;
    userId: UserProfile;
    speciality: string;
    experience: number;
    ratingAvg: number;
    fee: number;
    city: string;
    qualification: string;
    about: string;
    active: boolean;
    languages: string[];
    conditions: string[];
    availableDays: string[];
    reviews?: { rating: number; comment: string }[];
};

const DEFAULT_AVATAR = '/default-avatar.svg';

function getProfileUrl(profilePicture?: any): string {
    if (!profilePicture) return DEFAULT_AVATAR;
    if (typeof profilePicture === 'string') return profilePicture || DEFAULT_AVATAR;
    return profilePicture.Url || profilePicture.url || DEFAULT_AVATAR;
}

export default function DoctorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

    const [doctor, setDoctor] = useState<DoctorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startingChat, setStartingChat] = useState(false);

    const handleMessage = async () => {
        if (!doctor) return;
        if (!session?.user?._id) {
            toast.error('Please sign in to send a message');
            router.push('/signin');
            return;
        }
        if (String(session.user._id) === String(doctor.userId._id)) {
            toast.error("You can't message yourself");
            return;
        }
        try {
            setStartingChat(true);
            const convo = await chatApi.startConversation(doctor.userId._id);
            const base = session.user.role === 'doctor' ? '/doctors/messages' : '/messages';
            router.push(`${base}?c=${convo._id}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to start chat');
        } finally {
            setStartingChat(false);
        }
    };
    
    useEffect(()=>{
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                const response = await doctorApi.getDoctorProfileById(id);
                setDoctor(response.doctor);
                console.log('Doctor Data:', response);
            }
            catch (error) {
                console.error('Error fetching doctor data:', error);
                setError('Failed to load doctor details');
            } finally {
                setLoading(false);
            }
        }
        fetchDoctor();
    },[id]);
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading doctor details...</div>;
    }

    if (error || !doctor) {
        return <div className="flex items-center justify-center min-h-screen text-red-500">{error || 'Doctor not found'}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/doctors/eye-specialist" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Back to Doctors
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left Column ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Profile Hero Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-28 bg-linear-to-r from-blue-500 to-indigo-600" />
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
                                    <div className="relative w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-blue-50 flex items-center justify-center overflow-hidden">
                                        <img src={getProfileUrl(doctor.userId.profilePicture)} alt={doctor.userId.username} className="w-full h-full object-cover" />
                                        <span className={`absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${doctor.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div className="flex gap-2 pb-1">
                                        <button
                                            onClick={handleMessage}
                                            disabled={startingChat}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <MessageSquare className="w-4 h-4" /> {startingChat ? 'Opening…' : 'Message'}
                                        </button>
                                        <button className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${doctor.active ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} disabled={!doctor.active}>
                                            <Calendar className="w-4 h-4" /> Book Appointment
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-bold text-gray-900">{doctor.userId.username}</h1>
                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${doctor.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {doctor.active ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <p className="text-blue-600 font-medium mt-0.5 capitalize">{doctor.speciality.replace(/-/g, ' ')}</p>
                                    <p className="text-gray-500 text-sm mt-0.5">{doctor.qualification}</p>

                                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-gray-800">{doctor.ratingAvg || 'No rating'}</span>
                                            <span>({doctor.reviews?.length || 0} reviews)</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            {doctor.experience} years experience
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            {doctor.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        {doctor.about && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
                                <p className="text-gray-600 leading-relaxed text-sm">{doctor.about}</p>
                            </div>
                        )}

                        {/* Conditions Treated */}
                        {doctor.conditions && doctor.conditions.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Conditions Treated</h2>
                                <div className="flex flex-wrap gap-2">
                                    {doctor.conditions.map((c) => (
                                        <span key={c} className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Column ── */}
                    <div className="space-y-6">

                        {/* Consultation Fee */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Consultation Fee</h2>
                            <p className="text-3xl font-bold text-blue-600">Rs. {doctor.fee.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 mt-1">Per session (online / in-person)</p>
                            <button
                                className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${doctor.active ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                disabled={!doctor.active}
                            >
                                <Calendar className="w-4 h-4" />
                                {doctor.active ? 'Book Appointment' : 'Currently Unavailable'}
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Contact</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 break-all">{doctor.userId.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="text-gray-700">{doctor.city}, Pakistan</span>
                                </div>
                            </div>
                        </div>

                        {/* Languages */}
                        {doctor.languages && doctor.languages.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Languages</h2>
                                <div className="flex flex-wrap gap-2">
                                    {doctor.languages.map((lang) => (
                                        <span key={lang} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Days */}
                        {doctor.availableDays && doctor.availableDays.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-blue-500" /> Available Days
                                </h2>
                                <div className="space-y-2">
                                    {doctor.availableDays.map((day) => (
                                        <div key={day} className="flex items-center gap-2 text-sm">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="font-medium text-gray-700">{day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
