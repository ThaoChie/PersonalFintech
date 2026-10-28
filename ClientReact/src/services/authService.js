import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../common/constants';

// =========================================================
// AUTH SERVICE (Tầng Services)
// Trách nhiệm: Gọi các endpoints xác thực và người dùng
// KHÔNG làm: Không giữ state (state do AuthStore quản lý)
// =========================================================

export const authService = {
    login: async (credentials) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
        return response.data;
    },

    changePassword: async (data) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
        return response.data;
    }
};

export default authService;
