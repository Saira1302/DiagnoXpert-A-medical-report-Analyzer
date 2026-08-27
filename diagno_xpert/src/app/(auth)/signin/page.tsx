"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Form, FormField, FormError, Input, Label } from "@/components/ui";
import { string } from "../../../lib/validation";
import { toast } from "react-hot-toast";

export interface LoginFormData extends Record<string, unknown> {
    email: string;
    password: string;
}

export const loginSchema = {
    email: string({
        required: true,
        message: "Email is required",
    }),
    password: string({
        required: true,
        message: "Password is required",
    }),
};

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [role, setRole] = useState<string>();

    const initialValues: LoginFormData = useMemo(
        () => ({
            email: "",
            password: "",
        }),
        []
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

    const handleSubmit = async (values: Record<string, unknown>) => {
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: values.email as string,
                password: values.password as string,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                // Let the middleware read the token and redirect based on role:
                // doctors → /doctors, others → /home
                router.push("/signin");
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong! Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 dark:border-gray-700/50 p-8 md:p-10 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sign in to continue to DiagnoXpert
                    </p>
                </div>

                <Form
                    schema={loginSchema}
                    onSubmit={handleSubmit}
                    initialValues={initialValues}
                    options={{
                        validateOnBlur: false,
                        validateOnSubmit: true,
                        validateOnChange: false,
                    }}
                >
                    <div className="space-y-5">
                        {/* Email Field */}
                        <FormField name="email">
                            {({ value, onChange, onBlur, hasError }) => (
                                <div className="space-y-1.5">
                                    <Label required className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={value as string}
                                        onChange={(e) => onChange(e.target.value)}
                                        onBlur={onBlur}
                                        hasError={hasError}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        // Overriding inputClassName prop if it exists on Input component with direct className if supported, 
                                        // or assuming inputClassName can take these classes. 
                                        // To be safe based on previous code, I'll pass these to inputClassName.
                                        inputClassName="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                    <FormError name="email" />
                                </div>
                            )}
                        </FormField>

                        {/* Password Field */}
                        <FormField name="password">
                            {({ value, onChange, onBlur, hasError }) => (
                                <div className="space-y-1.5">
                                    <Label required className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={value as string}
                                        onChange={(e) => onChange(e.target.value)}
                                        onBlur={onBlur}
                                        hasError={hasError}
                                        placeholder="Enter your password"
                                        inputClassName="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                    <FormError name="password" />
                                </div>
                            )}
                        </FormField>

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Remember me</span>
                            </label>
                            <Link
                                href="/forgetPassword"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : "Sign In"}
                        </button>
                    </div>
                </Form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid gap-4">
                    <button
                        onClick={() => signIn("google", { callbackUrl: `/google-register?role=${role}` })}
                        className="flex items-center justify-center w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 font-medium transition-all duration-200 hover:shadow-md group"
                    >
                        <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                </div>

                <div className="text-center pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;