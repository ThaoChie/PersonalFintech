import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../common/constants';

// =========================================================
// TRANSACTION SERVICE (Tầng Services)
// Trách nhiệm: Gọi endpoint giao dịch, chuyển đổi phân trang 1-based <-> 0-based
// KHÔNG làm: Không giữ state (state do TransactionStore quản lý)
// =========================================================

export const transactionService = {
    /**
     * Lấy danh sách giao dịch có hỗ trợ tham số lọc và chuyển đổi phân trang
     * @param {Object} params - { keyword, page, pageSize, sort }
     * Lưu ý: UI dùng 1-based page, khi gửi sang query param nếu cần chuyển sang 0-based: pageIndex = page - 1
     */
    getTransactions: async (params = {}) => {
        const queryParams = {};
        
        if (params.keyword) {
            queryParams.keyword = params.keyword;
        }

        // Chuyển đổi phân trang 1-based từ UI sang 0-based cho API nếu được yêu cầu
        if (params.page !== undefined) {
            queryParams.pageIndex = Math.max(0, params.page - 1); // 1-based -> 0-based
        }
        if (params.pageSize !== undefined) {
            queryParams.pageSize = params.pageSize;
        }
        if (params.sort) {
            queryParams._sort = params.sort;
        }

        const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.BASE, { params: queryParams });
        return response.data;
    },

    createTransaction: async (data) => {
        const response = await apiClient.post(API_ENDPOINTS.TRANSACTIONS.BASE, data);
        return response.data;
    }
};

export default transactionService;
