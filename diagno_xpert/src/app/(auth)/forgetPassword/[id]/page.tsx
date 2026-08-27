// Responsive Signup Component
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { Form, FormField, FormError, Input, Label } from "@/components/ui";
import { string } from "../../../../lib/validation";
import { inputClassName, labelClassName, SignButtonClass } from "@/style";
import { toast } from "react-hot-toast";
import type { AppDispatch } from "@/redux/Store";
import { useDispatch } from "react-redux";
import { updatePassword } from "@/features/Auth/AuthSlice";

export interface SignupFormData extends Record<string, unknown> {
    password: string;
    conformPassword: string;
}

export const signupSchema = {
    password: string({ required: true, message: "Password must be at least 6 characters long", min: 6 }),
    conformPassword: string({
        required: true,
        message: "conform password required", min: 6
    })
};

const Signup = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const userId = params.id;

    const [loading, setLoading] = useState<boolean>(false)

    const initialValues: SignupFormData = useMemo(() => ({ password: "", conformPassword: "" }), []);

    const handleSubmit = async (values: Record<string, unknown>) => {
        setLoading(true);

        if(values.password !== values.conformPassword){
            toast.error("Password and Conform Password must be same");
            setLoading(false);
            return;
        }
        try {
            const data = { ...values, userId };
            await dispatch(updatePassword(data as any)).unwrap();
            toast.success("Password Update SuccessFully!");
            router.push("/signin");
        } catch (err: any) {
            toast.error(err?.message || "Password update failed");
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
                        <h2 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-200">Set Your Password</h2>
                    </div>

                    <Form
                        schema={signupSchema}
                        onSubmit={handleSubmit}
                        initialValues={initialValues}
                        options={{ validateOnBlur: false, validateOnSubmit: true, validateOnChange: false }}
                        className="p-2 sm:p-4"
                    >



                        <FormField name="password">
                            {({ value, onChange, onBlur, hasError }) => (
                                <div className="mb-2">
                                    <Label required className={labelClassName}>Password</Label>
                                    <Input id="password" type="password" inputClassName={inputClassName} value={value as string} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} hasError={hasError} placeholder="Enter your password" />
                                    <FormError name="password" />
                                </div>
                            )}
                        </FormField>

                        <FormField name="conformPassword">
                            {({ value, onChange, onBlur, hasError }) => (
                                <div className="mb-2">
                                    <Label required className={labelClassName}>Confirm Password</Label>
                                    <Input id="conformPassword" type="password" inputClassName={inputClassName} value={value as string} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} hasError={hasError} placeholder="Enter your password" />
                                    <FormError name="conformPassword" />
                                </div>
                            )}
                        </FormField>


                        <button type="submit" disabled={loading} className={SignButtonClass}>{loading ? "Updating Password..." : "Update Password"}</button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
