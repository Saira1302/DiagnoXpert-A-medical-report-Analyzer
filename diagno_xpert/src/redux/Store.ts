import { configureStore } from '@reduxjs/toolkit'
import AuthReducer from '@/features/Auth/AuthSlice'
import HomeReducer from '@/features/home/HomeSlice'
import ChatHistoryReducer from '@/features/home/ChatHistorySlice'
export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    home: HomeReducer,
    chatHistory: ChatHistoryReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch