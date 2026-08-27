// Responsive Signup Component
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, FormField, FormError, Input, Label } from "@/components/ui";
import { string } from "../../../lib/validation";
import { inputClassName, labelClassName, SignButtonClass } from "@/style";
import { toast } from "react-hot-toast";
import { Calendar28 } from "@/components/ui/datePicker";
import type { AppDispatch } from "@/redux/Store";
import { useDispatch } from "react-redux";
import { signupUser } from "@/features/Auth/AuthSlice";
import { signIn } from "next-auth/react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
export interface SignupFormData extends Record<string, unknown> {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  phoneNumber: string;
  role?: string;
}

export const signupSchema = {
  username: string({ required: true, message: "Username is required", min: 3 }),
  email: string({
    required: true,
    message: "Email is required",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),
  password: string({
    required: true,
    message: "Password must be at least 6 characters long",
    min: 6,
  }),
  dateOfBirth: string({ required: true, message: "Date of birth is required" }),
  phoneNumber: string({
    required: true,
    message: "Phone number must be between 7 to 15 digits",
    pattern: /^[0-9]{7,15}$/,
  }),
};

const countries = getCountries().map((code) => ({
  code,
  name: en[code] || code,
  dialCode: `+${getCountryCallingCode(code)}`,
}));

const Signup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("LoginType") || "patient";
    }
    return "patient";
  });
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.code === "PK") || countries[0]
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(
    () =>
      countries.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  useEffect(() => {
    const roleFromStorage = localStorage.getItem("LoginType");
    if (roleFromStorage) {
      setRole(roleFromStorage);
    }
    const handleLoginTypeChanged = () => {
      const storedRole = localStorage.getItem("LoginType");
      if (storedRole) {
        setRole(storedRole);
      }
    };

    window.addEventListener("LoginTypeChanged", handleLoginTypeChanged);

    return () => {
      window.removeEventListener("LoginTypeChanged", handleLoginTypeChanged);
    };
  }, []);

  const initialValues: SignupFormData = useMemo(
    () => ({
      username: "",
      email: "",
      password: "",
      dateOfBirth: "",
      phoneNumber: "",
      role: role || "patient",
    }),
    [role]
  );

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);

    try {
      const data = {
        values: {
          ...values,
          phoneNumber: `${selectedCountry.dialCode}${values.phoneNumber}`,
          role: role || "patient",
        },
      };
      await dispatch(signupUser(data as any)).unwrap();
      toast.success("Account created!");
      router.push("/signin");
      localStorage.removeItem("LoginType");
    } catch (err: any) {
      toast.error(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen pt-12 pb-10 overflow-y-auto bg-blue-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row items-center justify-center w-11/12 lg:w-10/12 mx-auto rounded-sm max-h-full shadow-sm">
        {/* Left Image Section */}
        <div className="w-full lg:w-2/4 hidden md:block ">
          <img
            src="/home-hero.png"
            alt="Signup"
            className="w-full h-full object-cover rounded-l-sm"
          />
        </div>

        {/* Right Form Section */}
        <div className="w-full  p-4 sm:p-6 md:p-8 dark:bg-gray-800 rounded-sm">
          <div className="text-center mt-2">
            <h2 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-200">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join us today! Please fill in the information below to register.
            </p>
          </div>

          <Form
            schema={signupSchema}
            onSubmit={handleSubmit}
            initialValues={initialValues}
            options={{
              validateOnBlur: false,
              validateOnSubmit: true,
              validateOnChange: false,
            }}
            className="p-2 sm:p-4"
          >
            {/* Username */}
            <FormField name="username">
              {({ value, onChange, onBlur, hasError }) => (
                <div className="mb-2">
                  <Label required className={labelClassName}>
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    inputClassName={inputClassName}
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    hasError={hasError}
                    placeholder="Enter your username"
                  />
                  <FormError name="username" />
                </div>
              )}
            </FormField>

            {/* Email */}
            <FormField name="email">
              {({ value, onChange, onBlur, hasError }) => (
                <div className="mb-2">
                  <Label required className={labelClassName}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    inputClassName={inputClassName}
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    hasError={hasError}
                    placeholder="Enter your email"
                  />
                  <FormError name="email" />
                </div>
              )}
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <FormField name="password">
                {({ value, onChange, onBlur, hasError }) => (
                  <div className="mb-2">
                    <Label required className={labelClassName}>
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      inputClassName={inputClassName}
                      value={value as string}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={onBlur}
                      hasError={hasError}
                      placeholder="Enter your password"
                    />
                    <FormError name="password" />
                  </div>
                )}
              </FormField>

              {/* Date of Birth */}
              <FormField name="dateOfBirth">
                {({ value, onChange, onBlur, hasError }) => (
                  <div className="mb-2">
                    <Label required className={labelClassName}>
                      Date of Birth
                    </Label>
                    <Calendar28
                      id="dateOfBirth"
                      inputClassName={inputClassName}
                      value={value as string}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={onBlur}
                      hasError={hasError}
                    />
                    <FormError name="dateOfBirth" />
                  </div>
                )}
              </FormField>
            </div>

            {/* Phone Number */}
            <FormField name="phoneNumber">
              {({ value, onChange, onBlur, hasError }) => (
                <div className="mb-2">
                  <Label required className={labelClassName}>
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(!showDropdown);
                          setSearch("");
                        }}
                        className={`${inputClassName} w-[110px]! shrink-0 cursor-pointer flex items-center justify-between gap-1`}
                      >
                        <span className="truncate text-sm">
                          {selectedCountry.code} {selectedCountry.dialCode}
                        </span>
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showDropdown && (
                        <div className="absolute z-50 mt-1 w-[260px] max-h-[200px] overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
                          <div className="sticky top-0 bg-white dark:bg-gray-800 p-2">
                            <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search country..."
                              className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200 outline-none"
                              autoFocus
                            />
                          </div>
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowDropdown(false);
                                setSearch("");
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                                selectedCountry.code === c.code ? "bg-blue-50 dark:bg-gray-700" : ""
                              }`}
                            >
                              {c.name} ({c.dialCode})
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                          )}
                        </div>
                      )}
                    </div>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      inputClassName={inputClassName}
                      value={value as string}
                      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                      onBlur={onBlur}
                      hasError={hasError}
                      placeholder="3001234567"
                    />
                  </div>
                  <FormError name="phoneNumber" />
                </div>
              )}
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className={SignButtonClass}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </Form>

          {/* Sign in */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative mx-4 my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid mx-4 mb-4">
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() =>
                signIn("google", {
                  callbackUrl: `/google-register?role=${role}`,
                })
              }
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
