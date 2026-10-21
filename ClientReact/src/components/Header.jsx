import React, { useState, useEffect } from 'react';
import axios from 'axios';
import vjuLogo from '../assets/logoVJU.png';

const Header = ({ onLogout }) => {
    const [user, setUser] = useState({ fullName: 'Admin', username: 'admin' });
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Load profile
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }

        axios.get('/api/Auth/profile')
            .then(res => {
                if (res.data) {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
            })
            .catch(() => {});

        // Load unread count
        axios.get('/api/Notification/unread-count')
            .then(res => setUnreadCount(res.data || 0))
            .catch(() => {});
    }, []);

    const toggleNotifications = async () => {
        if (!showNotifications) {
            try {
                const res = await axios.get('/api/Notification');
                setNotifications(res.data || []);
            } catch (err) {
                console.error(err);
            }
        }
        setShowNotifications(!showNotifications);
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/Notification/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header 
            style={{ 
                height: '56px', 
                backgroundColor: '#FFFFFF', 
                borderBottom: '1px solid #E5E7EB',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px'
            }}
        >
            {/* Left: VJU Logo & System Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={vjuLogo} alt="VJU Logo" style={{ height: '32px', width: 'auto' }} />
                <span style={{ height: '18px', width: '1px', backgroundColor: '#E5E7EB' }}></span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F1F1F', letterSpacing: '0.5px' }}>
                    OWLFIN
                </span>
            </div>

            {/* Right: Notifications & Profile Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={toggleNotifications}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            color: '#1F1F1F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px'
                        }}
                        title="Thông báo"
                    >
                        <i className="fa-regular fa-bell" style={{ fontSize: '16px' }}></i>
                        {/* BUG-13: Lỗi ngoài đặc tả - Hiển thị badge '0' khi unreadCount = 0 và không rút gọn '99+' khi > 99 */}
                        {unreadCount !== null && unreadCount !== undefined && (
                            <span 
                                id="notification-badge"
                                style={{
                                    position: 'absolute',
                                    top: '0px',
                                    right: '0px',
                                    backgroundColor: '#D32F2F',
                                    color: '#FFFFFF',
                                    borderRadius: '50%',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    minWidth: '18px',
                                    height: '18px',
                                    textAlign: 'center',
                                    lineHeight: '16px',
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
                                borderRadius: '6px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                zIndex: 1100,
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '13px', color: '#1F1F1F' }}>Thông báo</span>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="btn-vju-text" style={{ fontSize: '12px', padding: 0 }}>
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
                                                backgroundColor: n.isRead ? '#FFFFFF' : '#FAFAFA'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#1F1F1F', marginBottom: '2px' }}>
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

                <span style={{ height: '18px', width: '1px', backgroundColor: '#E5E7EB' }}></span>

                {/* Avatar & User Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '13px',
                            color: '#1F1F1F'
                        }}
                    >
                        {(user.fullName || user.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F1F1F' }}>
                        {user.fullName || user.username || 'Admin'}
                    </span>
                </div>

                {/* Logout Button */}
                <button 
                    onClick={onLogout}
                    className="btn-vju-text"
                    style={{ fontSize: '13px', marginLeft: '8px' }}
                    title="Đăng xuất"
                >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '14px' }}></i>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
