import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import vjuLogo from '../assets/logoVJU.png';
import { useAuthStore } from '../stores/authStore';

// =========================================================
// SIDEBAR COMPONENT (Tầng Components)
// Thiết kế theo chuẩn giao diện E-Form Chấm Điểm Rèn Luyện:
// - Header logo VJU + OWLFIN ở đỉnh sidebar
// - Bỏ nút Thêm giao dịch ở Sidebar (chỉ giữ 1 nút duy nhất ở Dashboard)
// - Danh mục 4 mục tối giản: Tổng quan, Quản lý Hũ, Lịch sử GD, Hồ sơ cá nhân
// - Nút Đăng xuất ghim cố định ở đáy Sidebar
// =========================================================

import { showConfirm } from '../common/toast';

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        const confirmed = await showConfirm({
            title: 'Đăng xuất tài khoản',
            text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Ở lại'
        });
        if (confirmed) {
            logout();
            navigate('/login');
        }
    };

    // Style cho từng NavLink theo mẫu E-Form
    const getNavLinkStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        margin: '2px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '13.5px',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#991B1B' : '#4B5563',
        backgroundColor: isActive ? '#FEF2F2' : 'transparent',
        transition: 'all 0.15s ease'
    });

    return (
        <aside 
            style={{ 
                width: '240px', 
                position: 'fixed', 
                top: 0, 
                bottom: 0, 
                left: 0, 
                zIndex: 1000,
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                userSelect: 'none'
            }}
        >
            {/* Top Section: Brand & Nav Links */}
            <div>
                {/* Brand Header */}
                <div 
                    style={{ 
                        height: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '0 18px', 
                        gap: '12px',
                        borderBottom: '1px solid #F3F4F6'
                    }}
                >
                    <img 
                        src={vjuLogo} 
                        alt="VJU Logo" 
                        style={{ height: '34px', width: '34px', objectFit: 'contain' }} 
                    />
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B', letterSpacing: '0.3px' }}>
                            OWLFIN
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 500, color: '#991B1B' }}>
                            Quản lý tài chính cá nhân
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <nav style={{ padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
                    <NavLink to="/" end style={getNavLinkStyle} className="sidebar-nav-item">
                        <i className="fa-solid fa-border-all" style={{ width: '22px', fontSize: '14px' }}></i>
                        <span>Tổng quan</span>
                    </NavLink>

                    <NavLink to="/jars" style={getNavLinkStyle} className="sidebar-nav-item">
                        <i className="fa-solid fa-box-archive" style={{ width: '22px', fontSize: '14px' }}></i>
                        <span>Quản lý Hũ</span>
                    </NavLink>

                    <NavLink to="/history" style={getNavLinkStyle} className="sidebar-nav-item">
                        <i className="fa-solid fa-clock-rotate-left" style={{ width: '22px', fontSize: '14px' }}></i>
                        <span>Lịch sử giao dịch</span>
                    </NavLink>

                    <NavLink to="/settings" style={getNavLinkStyle} className="sidebar-nav-item">
                        <i className="fa-regular fa-user" style={{ width: '22px', fontSize: '14px' }}></i>
                        <span>Hồ sơ cá nhân</span>
                    </NavLink>
                </nav>
            </div>

            {/* Bottom Section: Logout Pinned */}
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 14px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: '#6B7280',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.color = '#991B1B';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6B7280';
                    }}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '14px' }}></i>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;