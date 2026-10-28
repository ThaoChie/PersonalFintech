import axios from 'axios';

// =========================================================
// AXIOS INSTANCE & INTERCEPTORS (Tầng Lib/Axios)
// Trách nhiệm: Tạo HTTP client instance + Interceptor (JWT, lỗi chung)
// KHÔNG làm: Không chứa logic nghiệp vụ cụ thể
// =========================================================

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 1. Request Interceptor: Tự động gán JWT Bearer Token vào header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Bắt và xử lý các lỗi hệ thống chung (401 Unauthorized, lỗi mạng)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[HTTP 401] Phiên đăng nhập đã hết hạn hoặc không hợp lệ.');
            // Không xóa token nếu đang ở trang đăng nhập/đăng ký
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
