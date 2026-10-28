import React, { createContext, useContext, useState, useCallback } from 'react';
import jarService from '../services/jarService';
import transactionService from '../services/transactionService';
import dashboardService from '../services/dashboardService';

// =========================================================
// DASHBOARD STORE (Tầng Stores)
// Trách nhiệm: Tổng hợp dữ liệu tài chính, biểu đồ, gọi service
// KHÔNG làm: Không render UI
// =========================================================

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
    const [stats, setStats] = useState({ totalAssets: 0, income: 0, expense: 0 });
    const [jars, setJars] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [jarsData, transData, dashData] = await Promise.all([
                jarService.getJars().catch(() => []),
                transactionService.getTransactions().catch(() => []),
                dashboardService.getSummary().catch(() => null)
            ]);

            setJars(jarsData || []);

            // 1. Tính toán thống kê
            if (dashData && dashData.totalAssets !== undefined) {
                setStats({
                    totalAssets: dashData.totalAssets || 0,
                    income: dashData.monthIncome || dashData.income || 0,
                    expense: dashData.monthExpense || dashData.expense || 0
                });
            } else {
                const totalAssets = (jarsData || []).reduce((acc, jar) => acc + (jar.balance || 0), 0);
                const income = (transData || []).filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
                const expense = (transData || []).filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
                setStats({ totalAssets, income, expense });
            }

            // 2. Giao dịch gần đây (5 giao dịch mới nhất)
            const sorted = [...(transData || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentTransactions(sorted.slice(0, 5));

            // 3. Xây dựng dữ liệu Biểu đồ đường (Line Chart) 7 ngày gần nhất
            const days = [];
            const incomeData = [];
            const expenseData = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                days.push(dateStr);

                // Lọc giao dịch trong ngày này
                const dayTrans = (transData || []).filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getDate() === d.getDate() &&
                           tDate.getMonth() === d.getMonth() &&
                           tDate.getFullYear() === d.getFullYear();
                });

                const dayIncome = dayTrans.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
                const dayExpense = dayTrans.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

                incomeData.push(dayIncome);
                expenseData.push(dayExpense);
            }

            setLineChartData({
                labels: days,
                datasets: [
                    {
                        label: 'Thu nhập',
                        data: incomeData,
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Chi tiêu',
                        data: expenseData,
                        borderColor: '#DC2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            });

        } catch (err) {
            console.error('[DashboardStore] Lỗi tải dữ liệu:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        stats,
        jars,
        recentTransactions,
        lineChartData,
        isLoading,
        error,
        fetchDashboardData
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboardStore = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardStore phải được sử dụng bên trong DashboardProvider');
    }
    return context;
};

export default DashboardContext;
