'use client';

import { useEffect, useRef, useState } from 'react';
import { specialties } from '@/types/auth/doctor';
import Link from 'next/dist/client/link';

const DoctorsPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [counts, setCounts] = useState({ doctors: 0, support: 0, patients: 0 });
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, [isVisible]);

    useEffect(() => {
        if (isVisible) {
            const duration = 2000; // 2 seconds
            const steps = 60;
            const interval = duration / steps;

            const targets = { doctors: 500, support: 24, patients: 10000 };
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;

                setCounts({
                    doctors: Math.floor(targets.doctors * progress),
                    support: Math.floor(targets.support * progress),
                    patients: Math.floor(targets.patients * progress)
                });

                if (currentStep >= steps) {
                    setCounts(targets);
                    clearInterval(timer);
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [isVisible]);

   

    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white pt-10 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Consult Best Doctors Online
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Connect with certified specialists from the comfort of your home. 
                    Get expert medical advice anytime, anywhere.
                </p>
            </div>

            {/* Specialties Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {specialties.map((specialty, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                        >
                            <div className="relative h-48 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                                <img
                                    src={specialty.image}
                                    alt={specialty.name}
                                    className="h-32 w-32 object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {specialty.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {specialty.description}
                                </p>
                                <Link href={specialty.link} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Info Section */}
            <div ref={statsRef} className="max-w-7xl mx-auto mt-16 bg-white rounded-2xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                            {counts.doctors}+
                        </div>
                        <p className="text-gray-600">Certified Doctors</p>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                            {counts.support}/7
                        </div>
                        <p className="text-gray-600">Available Support</p>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                            {(counts.patients / 1000).toFixed(0)}k+
                        </div>
                        <p className="text-gray-600">Happy Patients</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-blue-600 mt-16 pt-16 pb-10 px-4 md:px-20 text-blue-100 text-sm rounded-tr-[100px] rounded-tl-[100px]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-blue-500 pb-12">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-bold text-white block mb-4">DiagnoXpert</span>
                        <p className="text-blue-50">Empowering health through advanced AI technology.</p>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Legal</h3>
                        <p className="text-blue-50">© 2026 DiagnoXpert. All rights reserved.</p>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-blue-50">Made with ❤️ for better health.</p>
                </div>
            </footer>
        </div>
    );
};

export default DoctorsPage;