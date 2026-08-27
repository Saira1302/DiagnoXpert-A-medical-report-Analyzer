import axios from "axios";

class ChatApi {
  async listConversations() {
    const res = await axios.get("/api/conversations");
    return res.data.conversations;
  }

  async startConversation(peerUserId: string) {
    const res = await axios.post("/api/conversations", { peerUserId });
    return res.data.conversation;
  }

  async getConversation(id: string) {
    const res = await axios.get(`/api/conversations/${id}`);
    return res.data.conversation;
  }

  async getMessages(conversationId: string) {
    const res = await axios.get(`/api/conversations/${conversationId}/messages`);
    return res.data.messages;
  }

  async sendMessage(conversationId: string, text: string) {
    const res = await axios.post(`/api/conversations/${conversationId}/messages`, {
      text,
    });
    return res.data.message;
  }
}

export default new ChatApi();
