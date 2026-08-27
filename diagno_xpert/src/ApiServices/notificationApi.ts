import axios from "axios";

class NotificationApi {
  async list() {
    const res = await axios.get("/api/notifications");
    return res.data as {
      notifications: any[];
      unreadCount: number;
    };
  }

  async markAllRead() {
    const res = await axios.put("/api/notifications");
    return res.data;
  }

  async markRead(id: string) {
    const res = await axios.put(`/api/notifications/${id}`);
    return res.data;
  }

  async remove(id: string) {
    const res = await axios.delete(`/api/notifications/${id}`);
    return res.data;
  }
}

export default new NotificationApi();
