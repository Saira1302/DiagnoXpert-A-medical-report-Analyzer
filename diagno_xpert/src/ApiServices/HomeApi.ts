import axios from "axios";

class HomeApi {
    async getUserProfileById(id: string) {
        const response = await axios.get(`/api/user/${id}`);
        return response.data;
    }

    async updateUserProfile(id: string, data: any) {
        const response = await axios.put(`/api/user/${id}`, data);
        return response.data;
    }
}
export default new HomeApi();