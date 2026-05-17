import api from "./api";

export const authService = {
    register: async (userData: any) => {
        const response = await api.post('/users/register', userData);
        return response.data
    },

    login: async (credentials: any) => {
        const response = await api.post('/users/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/users/logout');
        return response.data;
    },

    userDetails: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    employeeList: async () => {
        const response ('/users/list/employees');
        return response.data;
    }
}