// =========================================================
// CONSTANTS (Tầng Common)
// Trách nhiệm: Định nghĩa hằng số hệ thống, endpoints, mã màu VJU
// KHÔNG làm: Không import từ pages/
// =========================================================

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/Auth/login',
        REGISTER: '/api/Auth/register',
        PROFILE: '/api/Auth/profile',
        UPDATE_PROFILE: '/api/Auth/update-profile',
        CHANGE_PASSWORD: '/api/Auth/change-password'
    },
    JARS: {
        BASE: '/api/Jars',
        DETAIL: (id) => `/api/Jars/${id}`
    },
    TRANSACTIONS: {
        BASE: '/api/Transactions'
    },
    DASHBOARD: {
        SUMMARY: '/api/Dashboard/summary',
        BASE: '/api/Dashboard'
    },
    NOTIFICATIONS: {
        BASE: '/api/Notification',
        UNREAD_COUNT: '/api/Notification/unread-count',
        READ: (id) => `/api/Notification/${id}/read`,
        READ_ALL: '/api/Notification/read-all'
    }
};

export const DEFAULT_JARS = [
    { name: 'Thiết yếu', percent: 55, code: 'NEC' },
    { name: 'Tự do tài chính', percent: 10, code: 'FFA' },
    { name: 'Phát triển bản thân', percent: 10, code: 'EDU' },
    { name: 'Tiết kiệm dài hạn', percent: 10, code: 'LTSS' },
    { name: 'Hưởng thụ', percent: 10, code: 'PLAY' },
    { name: 'Cho đi', percent: 5, code: 'GIVE' }
];

export const VJU_THEME = {
    PRIMARY: '#8B1D24',
    PRIMARY_HOVER: '#6B141A',
    PRIMARY_ACCENT: '#C5221F',
    BACKGROUND: '#F8F9FA',
    CARD_BG: '#FFFFFF',
    BORDER: '#E5E7EB',
    TEXT_PRIMARY: '#1F2937',
    TEXT_MUTED: '#64748B',
    SUCCESS: '#198754',
    DANGER: '#DC2626'
};

export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense'
};
