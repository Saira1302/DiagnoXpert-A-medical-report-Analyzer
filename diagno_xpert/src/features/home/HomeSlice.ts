import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { HomeState } from "@/types/auth/";

const initialState: HomeState = {
    loading: false,
    result: null,
    error: null,
};

export const FileScan=createAsyncThunk(
    "home/fileScan",
    async (data:FormData,{rejectWithValue})=>{
        try{
            const response=await axios.post("/api/ocr",data);
            return response.data;
        }catch(err:any){
            return rejectWithValue({
                message:err?.response?.data?.message || "Something went wrong",
            });
        }
    }
);

const homeSlice=createSlice({
    name:"home",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(FileScan.pending,(state)=>{
            state.loading=true;
            state.error=null;
        });
        builder.addCase(FileScan.fulfilled,(state,action)=>{
            state.loading=false;
            state.result=action.payload;
        });
        builder.addCase(FileScan.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload as string ;
        });
    }
});

export default homeSlice.reducer;