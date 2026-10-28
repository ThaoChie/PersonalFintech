import React from 'react';
import { AuthProvider, useAuthStore } from './authStore';
import { JarProvider, useJarStore } from './jarStore';
import { TransactionProvider, useTransactionStore } from './transactionStore';
import { NotificationProvider, useNotificationStore } from './notificationStore';
import { DashboardProvider, useDashboardStore } from './dashboardStore';

// =========================================================
// APP PROVIDER (Tầng Stores)
// Trách nhiệm: Đóng gói toàn bộ các State Providers của ứng dụng
// =========================================================

export const AppProvider = ({ children }) => {
    return (
        <AuthProvider>
            <JarProvider>
                <TransactionProvider>
                    <NotificationProvider>
                        <DashboardProvider>
                            {children}
                        </DashboardProvider>
                    </NotificationProvider>
                </TransactionProvider>
            </JarProvider>
        </AuthProvider>
    );
};

// Re-export tất cả custom hooks để các pages/components dễ dàng import
export {
    useAuthStore,
    useJarStore,
    useTransactionStore,
    useNotificationStore,
    useDashboardStore
};

export default AppProvider;
