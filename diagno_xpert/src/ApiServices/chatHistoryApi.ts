import axios from "axios";

export type ChatMessageRole = "user" | "assistant";
export type ChatMessageType = "text" | "scan";

export interface ChatHistoryMessage {
  _id?: string;
  role: ChatMessageRole;
  type: ChatMessageType;
  content?: string;
  fileName?: string;
  userQuestion?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  createdAt?: string;
}

export interface ChatSummary {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatDetail extends ChatSummary {
  messages: ChatHistoryMessage[];
}

class ChatHistoryApi {
  async listChats(): Promise<ChatSummary[]> {
    const res = await axios.get("/api/modelHistory");
    return res.data?.chats || [];
  }

  async getChat(id: string): Promise<ChatDetail> {
    const res = await axios.get(`/api/modelHistory/${id}`);
    return res.data?.chat;
  }

  async createChat(title?: string): Promise<ChatDetail> {
    const res = await axios.post("/api/modelHistory", { title });
    return res.data?.chat;
  }

  async appendMessages(
    id: string,
    messages: ChatHistoryMessage[],
  ): Promise<ChatDetail> {
    const res = await axios.patch(`/api/modelHistory/${id}`, { messages });
    return res.data?.chat;
  }

  async renameChat(id: string, title: string): Promise<ChatDetail> {
    const res = await axios.patch(`/api/modelHistory/${id}`, { title });
    return res.data?.chat;
  }

  async deleteChat(id: string): Promise<void> {
    await axios.delete(`/api/modelHistory/${id}`);
  }
}

export default new ChatHistoryApi();
