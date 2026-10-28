import React, { createContext, useContext, useState, useCallback } from 'react';
import transactionService from '../services/transactionService';

// =========================================================
// TRANSACTION STORE (Tầng Stores)
// Trách nhiệm: Giữ state giao dịch thu/chi, gọi service, xử lý loading/lỗi
// KHÔNG làm: Không render UI
// =========================================================

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy danh sách giao dịch
    const fetchTransactions = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await transactionService.getTransactions(params);
            setTransactions(data || []);
            return data;
        } catch (err) {
            console.error('[TransactionStore] Lỗi tải giao dịch:', err);
            setError(err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Ghi nhận giao dịch mới
    const createTransaction = async (data) => {
        setIsLoading(true);
        try {
            const res = await transactionService.createTransaction(data);
            await fetchTransactions();
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        transactions,
        isLoading,
        error,
        fetchTransactions,
        createTransaction
    };

    return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactionStore = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactionStore phải được sử dụng bên trong TransactionProvider');
    }
    return context;
};

export default TransactionContext;
