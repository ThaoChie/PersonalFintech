import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../common/constants';

// =========================================================
// JAR SERVICE (Tầng Services)
// Trách nhiệm: Gọi các endpoints quản lý 6 Hũ tài chính
// KHÔNG làm: Không giữ state (state do JarStore quản lý)
// =========================================================

export const jarService = {
    getJars: async () => {
        const response = await apiClient.get(API_ENDPOINTS.JARS.BASE);
        return response.data;
    },

    createJar: async (jarData) => {
        const response = await apiClient.post(API_ENDPOINTS.JARS.BASE, jarData);
        return response.data;
    },

    updateJar: async (id, jarData) => {
        const response = await apiClient.put(API_ENDPOINTS.JARS.DETAIL(id), jarData);
        return response.data;
    },

    deleteJar: async (id) => {
        const response = await apiClient.delete(API_ENDPOINTS.JARS.DETAIL(id));
        return response.data;
    }
};

export default jarService;
