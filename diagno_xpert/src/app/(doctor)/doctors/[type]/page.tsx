'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { MapPin, User, Star, Clock, Filter } from 'lucide-react';
import doctorApi from '@/ApiServices/doctorApi';

type UserProfilePicture =
    | string
    | {
          Url?: string;
          url?: string;
      }
    | null
    | undefined;

type DoctorUser = {
    _id?: string;
    username?: string;
    gender?: string;
    profilePicture?: UserProfilePicture;
};

type Doctor = {
    _id: string | { toString(): string };
    speciality?: string;
    experience?: number;
    ratingAvg?: number;
    fee?: number;
    city?: string;
    qualification?: string;
    active?: boolean;
    userId?: DoctorUser;
};

const DEFAULT_AVATAR = '/default-avatar.svg';

function formatType(type: string) {
    return decodeURIComponent(type)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getProfileUrl(profilePicture: UserProfilePicture) {
    if (!profilePicture) return DEFAULT_AVATAR;
    if (typeof profilePicture === 'string') return profilePicture || DEFAULT_AVATAR;
    return profilePicture.Url || profilePicture.url || DEFAULT_AVATAR;
}

function formatGender(gender?: string) {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

function getDoctorId(id: string | { toString(): string }): string {
    return typeof id === 'string' ? id : id.toString();
}

export default function DoctorTypePage() {
    const params = useParams();
    const type = Array.isArray(params.type) ? params.type[0] : params.type ?? '';
    const specialtyLabel = formatType(type);

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCity, setSelectedCity] = useState('All Cities');
    const [selectedGender, setSelectedGender] = useState('All');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await doctorApi.getDoctorsBySpecialty({ specialty: type });
                setDoctors(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                setError('Failed to load doctors. Please try again.');
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [type]);

    const cities = useMemo(
        () => [
            'All Cities',
            ...Array.from(
                new Set(doctors.map((doctor) => doctor.city?.trim()).filter((city): city is string => !!city)),
            ),
        ],
        [doctors],
    );

    const genders = useMemo(
        () => [
            'All',
            ...Array.from(
                new Set(
                    doctors
                        .map((doctor) => doctor.userId?.gender?.trim())
                        .filter((gender): gender is string => !!gender),
                ),
            ),
        ],
        [doctors],
    );

    const filtered = useMemo(
        () =>
            doctors.filter((doctor) => {
                const cityMatch = selectedCity === 'All Cities' || (doctor.city || '') === selectedCity;
                const genderMatch = selectedGender === 'All' || (doctor.userId?.gender || '') === selectedGender;
                return cityMatch && genderMatch;
            }),
        [doctors, selectedCity, selectedGender],
    );


    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
            <div className="bg-white border-b border-gray-100 shadow-sm py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <p className="text-sm text-blue-600 font-medium mb-1">Doctors / {specialtyLabel}</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {specialtyLabel} Doctors
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                        <Filter className="w-4 h-4 text-blue-600" />
                        <span>Filter Doctors</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* City Filter */}
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> City
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full appearance-none pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    {cities.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px bg-gray-100" />

                        {/* Gender Filter */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <User className="w-3.5 h-3.5" /> Gender
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {genders.map((gender) => (
                                    <button
                                        key={gender}
                                        onClick={() => setSelectedGender(gender)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                                            selectedGender === gender
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                    >
                                        {formatGender(gender)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Cards */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading doctors...</div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No doctors found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((doctor) => (
                            <div
                                key={getDoctorId(doctor._id)}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group"
                            >
                                <div className="bg-linear-to-br from-blue-50 to-indigo-100 p-6 flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                            <img
                                                src={getProfileUrl(doctor.userId?.profilePicture)}
                                                alt={doctor.userId?.username || 'Doctor profile image'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                                                doctor.active ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {doctor.userId?.username || 'Doctor'}
                                        </h3>
                                        <p className="text-sm text-gray-500">{doctor.qualification || specialtyLabel}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs font-semibold text-gray-700">{doctor.ratingAvg || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                            {doctor.city || 'City not specified'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5 text-indigo-500" />
                                            {formatGender(doctor.userId?.gender)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-green-500" />
                                            {doctor.experience || 0} yrs exp
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">Consultation Fee</p>
                                            <p className="text-lg font-bold text-blue-600">Rs. {(doctor.fee || 0).toLocaleString()}</p>
                                        </div>
                                        {doctor.active ? (
                                            <Link href={`/doctors/detail/${doctor.userId?._id}`}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                            >
                                                Book Now
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                            >
                                                Unavailable
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
