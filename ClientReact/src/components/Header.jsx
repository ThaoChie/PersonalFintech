import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

// =========================================================
// HEADER COMPONENT (Tầng Components)
// Thiết kế theo chuẩn giao diện E-Form Chấm Điểm Rèn Luyện:
// - Bên trái: Tiêu đề trang hiện tại (Tổng quan, Quản lý Hũ, v.v.)
// - Bên phải: Pill phân loại ("Cá nhân"), Chuông thông báo (BUG-13), Avatar tròn than đậm + Tên người dùng
// =========================================================

const Header = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAllAsRead } = useNotificationStore();
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    const toggleNotifications = async () => {
        if (!showNotifications) {
            await fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    // Xác định tiêu đề trang dựa vào URL pathname
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/':
                return 'Tổng quan';
            case '/jars':
                return 'Quản lý Hũ';
            case '/history':
                return 'Lịch sử giao dịch';
            case '/settings':
                return 'Hồ sơ cá nhân';
            default:
                return 'Tổng quan';
        }
    };

    const displayName = user?.fullName || user?.username || 'Cá nhân';
    const initialLetter = displayName.charAt(0).toUpperCase();

    return (
        <header 
            style={{ 
                height: '60px', 
                backgroundColor: '#FFFFFF', 
                borderBottom: '1px solid #E5E7EB',
                position: 'fixed',
                top: 0,
                left: '240px',
                right: 0,
                zIndex: 990,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 28px'
            }}
        >
            {/* Left: Dynamic Page Title */}
            <div>
                <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right: Role Pill, Notification Bell, User Avatar & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                {/* Pill Tag */}
                <span 
                    style={{ 
                        backgroundColor: '#F3F4F6', 
                        color: '#4B5563', 
                        fontSize: '11.5px', 
                        fontWeight: 600, 
                        padding: '3px 10px', 
                        borderRadius: '9999px',
                        border: '1px solid #E5E7EB'
                    }}
                >
                    {user?.role === 'admin' ? 'Hệ thống' : 'Cá nhân'}
                </span>

                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={toggleNotifications}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            color: '#4B5563',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            position: 'relative',
                            transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Thông báo"
                    >
                        <i className="fa-regular fa-bell" style={{ fontSize: '16px' }}></i>
                        {/* BUG-13: Lỗi ngoài đặc tả - Hiển thị badge '0' khi unreadCount = 0 và không rút gọn '99+' khi > 99 */}
                        {unreadCount !== null && unreadCount !== undefined && (
                            <span 
                                id="notification-badge"
                                style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    backgroundColor: '#991B1B',
                                    color: '#FFFFFF',
                                    borderRadius: '50%',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    padding: '1px 4px',
                                    minWidth: '16px',
                                    height: '16px',
                                    textAlign: 'center',
                                    lineHeight: '14px',
                                    display: 'inline-block'
                                }}
                            >
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div 
                            style={{
                                position: 'absolute',
                                top: '44px',
                                right: '0',
                                width: '320px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '10px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                zIndex: 1100,
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>Thông báo</span>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead} 
                                        style={{ border: 'none', background: 'transparent', color: '#991B1B', fontSize: '12px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>
                            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                                        Không có thông báo mới
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            style={{
                                                padding: '10px 16px',
                                                borderBottom: '1px solid #F3F4F6',
                                                backgroundColor: n.isRead ? '#FFFFFF' : '#FEF2F2'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', marginBottom: '2px' }}>
                                                {n.title}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>
                                                {n.message}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar & User Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#111827',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '12.5px',
                            color: '#FFFFFF'
                        }}
                    >
                        {initialLetter}
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#111827' }}>
                        {displayName}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
