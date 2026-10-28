import React, { createContext, useContext, useState, useCallback } from 'react';
import jarService from '../services/jarService';

// =========================================================
// JAR STORE (Tầng Stores)
// Trách nhiệm: Giữ state 6 Hũ tài chính, gọi jarService, xử lý loading/lỗi
// KHÔNG làm: Không render UI
// =========================================================

const JarContext = createContext(null);

export const JarProvider = ({ children }) => {
    const [jars, setJars] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy danh sách hũ
    const fetchJars = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await jarService.getJars();
            setJars(data || []);
            return data;
        } catch (err) {
            console.error('[JarStore] Lỗi tải danh sách hũ:', err);
            setError(err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Tạo mới hũ
    const createJar = async (jarData) => {
        setIsLoading(true);
        try {
            const res = await jarService.createJar(jarData);
            await fetchJars();
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Cập nhật hũ
    const updateJar = async (id, jarData) => {
        setIsLoading(true);
        try {
            const res = await jarService.updateJar(id, jarData);
            await fetchJars();
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa hũ
    const deleteJar = async (id) => {
        setIsLoading(true);
        try {
            const res = await jarService.deleteJar(id);
            await fetchJars();
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        jars,
        isLoading,
        error,
        fetchJars,
        createJar,
        updateJar,
        deleteJar
    };

    return <JarContext.Provider value={value}>{children}</JarContext.Provider>;
};

export const useJarStore = () => {
    const context = useContext(JarContext);
    if (!context) {
        throw new Error('useJarStore phải được sử dụng bên trong JarProvider');
    }
    return context;
};

export default JarContext;
