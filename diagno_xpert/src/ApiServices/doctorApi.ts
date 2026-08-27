import axios from "axios";
class DoctorApi {
    async getDoctorProfileById(id: string) {
        const response = await axios.get(`/api/doctor/${id}`);
        return response.data;
    }

    async getDoctorsBySpecialty({specialty,gender,page,limit}:{specialty: string; gender?: string; page?: number; limit?: number}) {
        const response = await axios.get(`/api/doctor/${specialty}`, {
            params: {
                gender,
                page,
                limit
            }
        });
        return response.data.doctors;
    }

    async updateDoctorProfile(id: string, data: Record<string, unknown>) {
        const response = await axios.put(`/api/doctor/${id}`, data);
        return response.data;
    }
}

export default new DoctorApi();