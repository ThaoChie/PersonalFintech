import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { ROLES } from '../common/roles';

// =========================================================
// AUTH STORE (Tầng Stores)
// Trách nhiệm: Giữ state xác thực, gọi service, xử lý loading/lỗi
// KHÔNG làm: Không render UI
// =========================================================

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : { fullName: '', email: '', username: '', role: ROLES.USER, allocationDay: 1 };
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Đồng bộ profile người dùng
    const fetchProfile = useCallback(async () => {
        if (!localStorage.getItem('token')) return null;
        try {
            const data = await authService.getProfile();
            const updatedUser = {
                ...data,
                fullName: data.fullName || data.name || user.fullName,
                role: data.role || ROLES.USER,
                allocationDay: data.allocationDay || 1
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (err) {
            console.error('[AuthStore] Lỗi tải profile:', err);
            return null;
        }
    }, [user.fullName]);

    // Đăng nhập
    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authService.login(credentials);
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setIsAuthenticated(true);

                const loggedUser = {
                    username: data.username || credentials.email,
                    fullName: data.fullName || data.username || 'Người dùng',
                    email: data.email || credentials.email,
                    role: data.role || ROLES.USER,
                    allocationDay: data.allocationDay || 1
                };
                setUser(loggedUser);
                localStorage.setItem('user', JSON.stringify(loggedUser));
            }
            return data;
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Đăng nhập thất bại.';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Đăng ký
    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authService.register(userData);
            return data;
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Đăng ký thất bại.';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Đăng xuất
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken('');
        setUser({ fullName: '', email: '', username: '', role: ROLES.USER });
        setIsAuthenticated(false);
    };

    // Cập nhật hồ sơ
    const updateProfile = async (profileData) => {
        setIsLoading(true);
        try {
            const res = await authService.updateProfile(profileData);
            const updatedUser = { 
                ...user, 
                fullName: profileData.fullName,
                allocationDay: profileData.allocationDay !== undefined ? profileData.allocationDay : (user.allocationDay || 1)
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Đổi mật khẩu
    const changePassword = async (passwordData) => {
        setIsLoading(true);
        try {
            const res = await authService.changePassword(passwordData);
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, fetchProfile]);

    const value = {
        token,
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
        changePassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthStore = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthStore phải được sử dụng bên trong AuthProvider');
    }
    return context;
};

export default AuthContext;
