// Responsive Signup Component
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Form, FormField, FormError, Input, Label } from "@/components/ui";
import { string } from "../../../lib/validation";
import { inputClassName, labelClassName, SignButtonClass } from "@/style";
import { toast } from "react-hot-toast";
import type { AppDispatch } from "@/redux/Store";
import { useDispatch } from "react-redux";
import { SendForgetEmail } from "@/features/Auth/AuthSlice";

export interface SignupFormData extends Record<string, unknown> {
   email: string;
}

export const signupSchema = {
    email: string({ required: true, message: "Email is required" })
};

const ForgetPasswordEmail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false)

    const initialValues: SignupFormData = useMemo(() => ({ email:"" }), []);

    const handleSubmit = async (values: Record<string, unknown>) => {
        setLoading(true);
console.log(values);
        try {
            const data = { ...values };
            await dispatch(SendForgetEmail(data as any)).unwrap();
            toast.success("Email Sent Successfully!");
            // router.push("/signin");
        } catch (err: any) {
            toast.error(err?.message || "Try again their is issue to send email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen pt-4 pb-10 overflow-y-auto bg-blue-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col lg:flex-row items-center justify-center w-11/12 lg:w-10/12 mx-auto rounded-sm max-h-full shadow-sm">

                {/* Left Image Section */}
                <div className="w-full lg:w-2/4 hidden md:block ">
                    <img src="/home-hero.png" alt="Signup" className="w-full h-full object-cover rounded-l-sm" />
                </div>

                {/* Right Form Section */}
                <div className="w-full  p-4 sm:p-6 md:p-8 dark:bg-gray-800 rounded-sm">
                    <div className="text-center mt-2">
                        <h2 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-200">Enter Your Email</h2>
                    </div>

                    <Form
                        schema={signupSchema}
                        onSubmit={handleSubmit}
                        initialValues={initialValues}
                        options={{ validateOnBlur: false, validateOnSubmit: true, validateOnChange: false }}
                        className="p-2 sm:p-4"
                    >
                            <FormField name="email">
                                {({ value, onChange, onBlur, hasError }) => (
                                    <div className="mb-2">
                                        <Label required className={labelClassName}>Email</Label>
                                        <Input id="email" type="email" inputClassName={inputClassName} value={value as string} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} hasError={hasError} placeholder="Enter your email" />
                                        <FormError name="email" />
                                    </div>
                                )}
                            </FormField>

                      
                        <button type="submit" disabled={loading} className={SignButtonClass}>{loading ? "Sending Email..." : "Send Email"}</button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ForgetPasswordEmail;
