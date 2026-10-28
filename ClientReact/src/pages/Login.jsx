import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showSuccess, showError, showWarning } from '../common/toast';
import vjuLogo from '../assets/logoVJU.png';
import { useAuthStore } from '../stores/authStore';

const Login = ({ onLoginSuccess, initialMode = 'login' }) => {
    const location = useLocation();
    const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
    const [isLoginView, setIsLoginView] = useState(!isRegisterRoute);
    const { login, register } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra độ dài mật khẩu khi đăng ký (tối thiểu 8 ký tự theo BR-02)
        if (!isLoginView && (!formData.password || formData.password.length < 8)) {
            showWarning('Mật khẩu phải có tối thiểu 8 ký tự.', 'Mật khẩu không hợp lệ');
            return;
        }

        // Kiểm tra xác nhận mật khẩu khi đăng ký
        if (!isLoginView && formData.password !== formData.confirmPassword) {
            showWarning('Mật khẩu xác nhận phải trùng khớp với mật khẩu đã nhập.', 'Mật khẩu không khớp');
            return;
        }

        setIsLoading(true);

        try {
            if (isLoginView) {
                await login({ email: formData.email, password: formData.password });
                showSuccess('Đăng nhập thành công!');
                if (onLoginSuccess) onLoginSuccess();
                navigate('/');
            } else {
                await register({
                    fullName: formData.fullName,
                    username: formData.email,
                    email: formData.email,
                    password: formData.password
                });
                showSuccess('Tài khoản đã được tạo với 6 hũ mặc định. Vui lòng đăng nhập.', 'Đăng ký thành công!');
                setIsLoginView(true);
            }
        } catch (error) {
            const errorText = typeof error.response?.data === 'string' 
                ? error.response.data 
                : error.response?.data?.message || error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            
            showError(errorText, isLoginView ? 'Đăng nhập thất bại' : 'Đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            style={{
                minHeight: '100vh',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            <div 
                style={{
                    width: '100%',
                    maxWidth: '430px',
                    margin: '0 auto'
                }}
            >
                {/* Logo VJU */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <img 
                        src={vjuLogo} 
                        alt="Vietnam Japan University" 
                        style={{
                            width: '78px',
                            height: '78px',
                            objectFit: 'contain',
                            display: 'inline-block'
                        }}
                    />
                </div>

                {/* Tiêu đề & Phụ đề */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h2 
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#1E293B',
                            margin: '0 0 6px 0'
                        }}
                    >
                        {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
                    </h2>
                    <p 
                        style={{
                            fontSize: '14px',
                            color: '#64748B',
                            margin: 0
                        }}
                    >
                        OWLFIN - Quản lý tài chính cá nhân
                    </p>
                </div>

                {/* Form thao tác */}
                <form onSubmit={handleSubmit}>
                    {/* Họ và tên (chỉ khi đăng ký) */}
                    {!isLoginView && (
                        <div style={{ marginBottom: '18px' }}>
                            <label 
                                htmlFor="fullName"
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    marginBottom: '6px'
                                }}
                            >
                                Họ và tên <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Nguyễn Văn A"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '14px',
                                    color: '#1E293B',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: '#FFFFFF',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#B91C1C'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div style={{ marginBottom: '18px' }}>
                        <label 
                            htmlFor="email"
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: '6px'
                            }}
                        >
                            Email <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="youremail@gmail.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                fontSize: '14px',
                                color: '#1E293B',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: '#FFFFFF',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#B91C1C'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div style={{ marginBottom: isLoginView ? '24px' : '18px' }}>
                        <label 
                            htmlFor="password"
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: '6px'
                            }}
                        >
                            Mật khẩu <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 42px 10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '14px',
                                    color: '#1E293B',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: '#FFFFFF',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#B91C1C'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    color: '#94A3B8',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu (chỉ khi đăng ký) */}
                    {!isLoginView && (
                        <div style={{ marginBottom: '24px' }}>
                            <label 
                                htmlFor="confirmPassword"
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    marginBottom: '6px'
                                }}
                            >
                                Xác nhận mật khẩu <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 42px 10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px',
                                        color: '#1E293B',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        backgroundColor: '#FFFFFF',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#B91C1C'}
                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        color: '#94A3B8',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nút hành động chính chuẩn VJU Red */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '11px 16px',
                            backgroundColor: isLoading ? '#DC2626' : '#C5221F',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s, transform 0.1s',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = '#991B1B';
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = '#C5221F';
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <i className={`fa-solid ${isLoginView ? 'fa-lock' : 'fa-user-plus'}`}></i>
                                <span>{isLoginView ? 'Đăng nhập' : 'Đăng ký'}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Liên kết chuyển đổi giữa Đăng nhập và Đăng ký */}
                <div 
                    style={{
                        textAlign: 'center',
                        marginTop: '22px',
                        fontSize: '14px',
                        color: '#64748B'
                    }}
                >
                    {isLoginView ? (
                        <>
                            <span>Chưa có tài khoản? </span>
                            <button
                                type="button"
                                onClick={() => setIsLoginView(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#C5221F',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '14px',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Đăng ký ngay
                            </button>
                        </>
                    ) : (
                        <>
                            <span>Đã có tài khoản? </span>
                            <button
                                type="button"
                                onClick={() => setIsLoginView(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#C5221F',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '14px',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Đăng nhập
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
