import React, { createContext, useContext, useState, useCallback } from 'react';
import notificationService from '../services/notificationService';

// =========================================================
// NOTIFICATION STORE (Tầng Stores)
// Trách nhiệm: Giữ state thông báo, gọi notificationService, xử lý loading/lỗi
// KHÔNG làm: Không render UI
// =========================================================

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Lấy danh sách thông báo
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data || []);
            return data;
        } catch (err) {
            console.error('[NotificationStore] Lỗi tải thông báo:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Lấy số lượng thông báo chưa đọc
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count || 0);
            return count;
        } catch (err) {
            console.error('[NotificationStore] Lỗi tải số thông báo chưa đọc:', err);
            return 0;
        }
    }, []);

    // Đánh dấu 1 thông báo đã đọc
    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[NotificationStore] Lỗi đánh dấu đã đọc:', err);
            throw err;
        }
    };

    // Đánh dấu tất cả đã đọc
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('[NotificationStore] Lỗi đánh dấu tất cả đã đọc:', err);
            throw err;
        }
    };

    const value = {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationStore = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationStore phải được sử dụng bên trong NotificationProvider');
    }
    return context;
};

export default NotificationContext;
