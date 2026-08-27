import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { SignupState, SignUpUser } from "@/types/auth";

const initialState: SignupState = {
    loading: false,
    error: null,
    success: false,
};

export const signupUser = createAsyncThunk(
    "signup/register",
    async (data: SignUpUser, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/signup", data);

            if (response.status !== 201) {
                return rejectWithValue(response.data?.message || "Signup failed");
            }

            return response.data;
        } catch (err: any) {
            return rejectWithValue({
                message: err?.response?.data?.message || "Something went wrong",
            });

        }
    }
);

export const SendForgetEmail = createAsyncThunk(
    "signup/forgetPassword",
    async (data: { email: string }, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/signup", {
                params: {
                    email: data.email, 
                },
            });

            if (response.status !== 200) {
                return rejectWithValue(response.data?.message || "Something went wrong");
            }
            return response.data.data;
        } catch (err: any) {
            return rejectWithValue({
                message: err?.response?.data?.message || "Something went wrong",
            });
        }
    }
);

export const updatePassword = createAsyncThunk(
    "signup/updatePassword",
    async (data: { userId: string; password: string; confirmPassword: string }, { rejectWithValue }) => {
        try {
            const response = await axios.put("/api/signup", data);
            if (response.status !== 200) {
                return rejectWithValue(response.data?.message || "Password update failed");
            }
            return response.data;
        } catch (err: any) {
            return rejectWithValue({
                message: err?.response?.data?.message || "Something went wrong",
            });
        }
    }
);

const signupSlice = createSlice({
    name: "signup",
    initialState,
    reducers: {
        resetSignupState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    }
});

export const { resetSignupState } = signupSlice.actions;
export default signupSlice.reducer;
