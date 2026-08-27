import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ChatHistoryApi, {
  ChatDetail,
  ChatHistoryMessage,
  ChatSummary,
} from "@/ApiServices/chatHistoryApi";

interface ChatHistoryState {
  chats: ChatSummary[];
  currentChatId: string | null;
  messages: ChatHistoryMessage[];
  loadingList: boolean;
  loadingChat: boolean;
  error: string | null;
}

const initialState: ChatHistoryState = {
  chats: [],
  currentChatId: null,
  messages: [],
  loadingList: false,
  loadingChat: false,
  error: null,
};

export const fetchChats = createAsyncThunk(
  "chatHistory/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      return await ChatHistoryApi.listChats();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e?.response?.data?.message || "Failed to load chats",
      );
    }
  },
);

export const fetchChatById = createAsyncThunk(
  "chatHistory/fetchChatById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await ChatHistoryApi.getChat(id);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e?.response?.data?.message || "Failed to load chat",
      );
    }
  },
);

export const createChat = createAsyncThunk(
  "chatHistory/createChat",
  async (title: string | undefined, { rejectWithValue }) => {
    try {
      return await ChatHistoryApi.createChat(title);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e?.response?.data?.message || "Failed to create chat",
      );
    }
  },
);

export const persistMessages = createAsyncThunk(
  "chatHistory/persistMessages",
  async (
    args: { id: string; messages: ChatHistoryMessage[] },
    { rejectWithValue },
  ) => {
    try {
      return await ChatHistoryApi.appendMessages(args.id, args.messages);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e?.response?.data?.message || "Failed to save messages",
      );
    }
  },
);

export const deleteChat = createAsyncThunk(
  "chatHistory/deleteChat",
  async (id: string, { rejectWithValue }) => {
    try {
      await ChatHistoryApi.deleteChat(id);
      return id;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e?.response?.data?.message || "Failed to delete chat",
      );
    }
  },
);

const chatHistorySlice = createSlice({
  name: "chatHistory",
  initialState,
  reducers: {
    startNewChat: (state) => {
      state.currentChatId = null;
      state.messages = [];
    },
    addLocalMessage: (state, action: PayloadAction<ChatHistoryMessage>) => {
      state.messages.push(action.payload);
    },
    setCurrentChatId: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loadingList = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload as string;
      })

      .addCase(fetchChatById.pending, (state) => {
        state.loadingChat = true;
        state.error = null;
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.loadingChat = false;
        const chat = action.payload as ChatDetail;
        state.currentChatId = chat._id;
        state.messages = chat.messages || [];
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.loadingChat = false;
        state.error = action.payload as string;
      })

      .addCase(createChat.fulfilled, (state, action) => {
        const chat = action.payload as ChatDetail;
        state.currentChatId = chat._id;
        state.messages = [];
        state.chats = [
          {
            _id: chat._id,
            title: chat.title,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          },
          ...state.chats.filter((c) => c._id !== chat._id),
        ];
      })

      .addCase(persistMessages.fulfilled, (state, action) => {
        const chat = action.payload as ChatDetail;
        const summary: ChatSummary = {
          _id: chat._id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
        state.chats = [
          summary,
          ...state.chats.filter((c) => c._id !== chat._id),
        ];
        if (state.currentChatId === chat._id) {
          state.messages = chat.messages || [];
        }
      })

      .addCase(deleteChat.fulfilled, (state, action) => {
        const id = action.payload as string;
        state.chats = state.chats.filter((c) => c._id !== id);
        if (state.currentChatId === id) {
          state.currentChatId = null;
          state.messages = [];
        }
      });
  },
});

export const { startNewChat, addLocalMessage, setCurrentChatId } =
  chatHistorySlice.actions;
export default chatHistorySlice.reducer;
