"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  User,
  Home,
  LayoutDashboard,
  LogOut,
  AlertTriangle,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "@/components/page/chat/NotificationBell";

export default function DoctorNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide navbar on doctor profile page
  if (pathname.startsWith("/doctors/profile")) return null;

  const baseLinks = [
    {
      href: "/home",
      label: "Home",
      icon: Home,
    },
    {
      href: "/doctors",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
  ];

  const navLinks = session?.user?.role === "doctor"
    ? [
        ...baseLinks,
        { href: "/doctors/messages", label: "Messages", icon: MessageSquare },
      ]
    : baseLinks;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Logo */}
          <Link href="/doctors" className="shrink-0 group">
            <div className="relative w-28 h-10 sm:w-44 sm:h-14">
              <Image
                src="/logo.png"
                alt="DiagnoXpert Logo"
                fill
                className="object-contain group-hover:opacity-80 transition-opacity"
                priority
              />
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {session?.user?.role === "doctor" && (
              <>
                <div className="w-px h-8 bg-gray-200 mx-1 sm:mx-2" />
                <NotificationBell variant="light" />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <img
                      src={
                        session?.user?.profilePicture ||
                        session?.user?.image ||
                        "/default-avatar.svg"
                      }
                      alt={session?.user?.username || "User"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {session?.user?.username || session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight">
                        Doctor
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session?.user?.username || session?.user?.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {session?.user?.email}
                        </p>
                      </div>

                      {/* Profile Link */}
                      <Link
                        href={`/doctors/profile/${session?.user?._id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile
                      </Link>

                      {/* Divider */}
                      <div className="h-px bg-gray-100 my-1" />

                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowLogoutDialog(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Divider */}

            {/* User Avatar Dropdown */}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to sign out of your account?
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
