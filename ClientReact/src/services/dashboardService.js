import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../common/constants';

// =========================================================
// DASHBOARD SERVICE (Tầng Services)
// Trách nhiệm: Gọi endpoint lấy dữ liệu tổng hợp Dashboard
// KHÔNG làm: Không giữ state
// =========================================================

export const dashboardService = {
    getSummary: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
            return response.data;
        } catch {
            // Fallback sang endpoint /api/Dashboard nếu /summary trả về 404
            const fallbackResponse = await apiClient.get(API_ENDPOINTS.DASHBOARD.BASE);
            return fallbackResponse.data;
        }
    }
};

export default dashboardService;
