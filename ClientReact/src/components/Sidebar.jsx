import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ onOpenGlobalModal }) => {
    const navigate = useNavigate();
    
    // State lưu thông tin user
    const [user, setUser] = useState({ username: 'Loading...', email: '' });

    useEffect(() => {
        // Cách 1: Ưu tiên lấy từ LocalStorage cho nhanh (nếu lúc Login đã lưu)
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }

        // Cách 2: Gọi API để lấy thông tin mới nhất (Sửa lỗi 404 profile)
        axios.get('/api/Auth/profile')
            .then(res => {
                setUser(res.data);
                // Cập nhật lại localStorage luôn cho đồng bộ
                localStorage.setItem('user', JSON.stringify(res.data));
            })
            .catch(err => {
                console.log("Không lấy được profile, dùng tạm local storage", err);
            });
    }, []);

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.clear();
            navigate('/login');
            window.location.reload();
        }
    };

    // Style cho Link theo chuẩn UI VJU: Active có thanh đỏ 3px bên trái
    const getLinkClass = ({ isActive }) => 
        `d-flex align-items-center py-3 px-4 text-decoration-none transition-all ${
            isActive 
            ? 'text-dark fw-bold border-start border-3 border-danger bg-light' 
            : 'text-secondary'
        }`;

    return (
        <div 
            className="bg-white d-flex flex-column" 
            style={{ 
                width: '240px', 
                position: 'fixed', 
                top: '56px', 
                bottom: 0, 
                left: 0, 
                zIndex: 1000,
                borderRight: '1px solid #E5E7EB'
            }}
        >
            {/* Quick Action: Thêm giao dịch toàn cục */}
            <div className="p-3">
                <button 
                    onClick={onOpenGlobalModal} 
                    className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    style={{ backgroundColor: '#D32F2F', color: '#FFFFFF', height: '38px', borderRadius: '6px' }}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm giao dịch</span>
                </button>
            </div>

            {/* 2. MENU ITEMS - 13 Core Use Cases */}
            <div className="flex-grow-1 overflow-auto py-2">
                <div className="px-4 mb-2 text-uppercase text-muted fw-bold" style={{fontSize: '11px', letterSpacing: '0.8px'}}>
                    Menu chính
                </div>
                
                <NavLink to="/" className={getLinkClass}>
                    <i className="fa-solid fa-chart-pie me-3" style={{width: '18px', color: '#1F1F1F'}}></i>
                    <span>Tổng quan</span>
                </NavLink>

                <NavLink to="/jars" className={getLinkClass}>
                    <i className="fa-solid fa-wallet me-3" style={{width: '18px', color: '#1F1F1F'}}></i>
                    <span>Quản lý Hũ</span>
                </NavLink>

                <NavLink to="/history" className={getLinkClass}>
                    <i className="fa-solid fa-clock-rotate-left me-3" style={{width: '18px', color: '#1F1F1F'}}></i>
                    <span>Lịch sử GD</span>
                </NavLink>

                <div className="my-3 border-top mx-3" style={{ borderColor: '#E5E7EB' }}></div>

                <div className="px-4 mb-2 text-uppercase text-muted fw-bold" style={{fontSize: '11px', letterSpacing: '0.8px'}}>
                    Tài khoản
                </div>

                <NavLink to="/settings" className={getLinkClass}>
                    <i className="fa-solid fa-user-gear me-3" style={{width: '18px', color: '#1F1F1F'}}></i>
                    <span>Hồ sơ cá nhân</span>
                </NavLink>
            </div>

            {/* 3. FOOTER */}
            <div className="p-3 border-top" style={{ borderColor: '#E5E7EB' }}>
                <div className="text-muted text-center" style={{ fontSize: '11px' }}>
                    OWLFIN v1.0 • VJU
                </div>
            </div>
        </div>
    );
};

export default Sidebar;