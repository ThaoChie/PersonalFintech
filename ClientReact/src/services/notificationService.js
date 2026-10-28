import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../common/constants';

// =========================================================
// NOTIFICATION SERVICE (Tầng Services)
// Trách nhiệm: Gọi endpoint thông báo hệ thống
// KHÔNG làm: Không giữ state
// =========================================================

export const notificationService = {
    getNotifications: async () => {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.READ(id));
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
        return response.data;
    }
};

export default notificationService;
