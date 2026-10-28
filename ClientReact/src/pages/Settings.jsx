import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { showSuccess, showError, showWarning } from '../common/toast';

const Settings = () => {
    const { user, fetchProfile, updateProfile, changePassword } = useAuthStore();

    // Helper lấy chuỗi YYYY-MM-DDTHH:mm từ ngày (1 - 31)
    const getLocalDateTimeString = (day = 1) => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const safeDay = Math.min(Math.max(1, parseInt(day, 10) || 1), 31);
        const dd = String(safeDay).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T00:00`;
    };

    // --- STATE CHO THÔNG TIN CÁ NHÂN ---
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        allocationDay: 1
    });

    const [allocationDateTime, setAllocationDateTime] = useState(() => getLocalDateTimeString(1));

    // --- STATE CHO ĐỔI MẬT KHẨU ---
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    // 1. Load thông tin khi vào trang
    useEffect(() => {
        if (user && (user.fullName || user.email)) {
            const day = user.allocationDay || 1;
            setProfile({
                fullName: user.fullName || '',
                email: user.email || '',
                allocationDay: day
            });
            setAllocationDateTime(getLocalDateTimeString(day));
        } else {
            fetchProfile().then(data => {
                if (data) {
                    const day = data.allocationDay || 1;
                    setProfile({
                        fullName: data.fullName || '',
                        email: data.email || '',
                        allocationDay: day
                    });
                    setAllocationDateTime(getLocalDateTimeString(day));
                }
            });
        }
    }, [user, fetchProfile]);

    const handleDateTimeChange = (e) => {
        const val = e.target.value;
        setAllocationDateTime(val);
        if (val) {
            const datePart = val.split('T')[0];
            const parts = datePart.split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[2], 10);
                if (!isNaN(day) && day >= 1 && day <= 31) {
                    setProfile(prev => ({ ...prev, allocationDay: day }));
                }
            }
        }
    };

    // 2. Xử lý Cập nhật thông tin (Tên & Ngày phân bổ T)
    const handleUpdateProfile = async () => {
        if (!profile.fullName.trim()) {
            return showWarning("Tên không được để trống!", "Thiếu thông tin");
        }
        
        let day = parseInt(profile.allocationDay, 10);
        if (allocationDateTime) {
            const datePart = allocationDateTime.split('T')[0];
            const parts = datePart.split('-');
            if (parts.length === 3) {
                const parsedDay = parseInt(parts[2], 10);
                if (!isNaN(parsedDay)) day = parsedDay;
            }
        }

        if (isNaN(day) || day < 1 || day > 31) {
            return showWarning("Ngày phân bổ cố định (Ngày T) phải từ 1 đến 31!", "Ngày không hợp lệ");
        }

        setIsLoading(true);
        try {
            const res = await updateProfile({
                fullName: profile.fullName,
                allocationDay: day
            });
            
            showSuccess(res?.message || 'Cập nhật hồ sơ thành công!');
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || 'Cập nhật thông tin thất bại.';
            showError(errorMsg, "Lỗi cập nhật");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Xử lý Đổi mật khẩu
    const handleChangePassword = async () => {
        const { oldPassword, newPassword, confirmPassword } = passwords;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return showWarning("Vui lòng nhập đầy đủ các trường mật khẩu!", "Thiếu thông tin");
        }
        if (newPassword !== confirmPassword) {
            return showWarning("Mật khẩu mới không khớp!", "Xác nhận mật khẩu");
        }
        if (newPassword.length < 6) {
            return showWarning("Mật khẩu mới phải có ít nhất 6 ký tự!", "Mật khẩu quá ngắn");
        }

        setIsLoading(true);
        try {
            const res = await changePassword({
                oldPassword: oldPassword,
                newPassword: newPassword
            });

            showSuccess(res?.message || 'Đổi mật khẩu thành công!');
            // Reset form mật khẩu
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });

        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại.';
            showError(errorMsg, "Lỗi đổi mật khẩu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                Hồ sơ & Bảo mật
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>
                Quản lý thông tin tài khoản cá nhân và thiết lập mật khẩu đăng nhập an toàn.
            </p>
            
            <div className="row g-4">
                {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
                <div className="col-lg-6">
                    <div 
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                            <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                Thông tin cá nhân
                            </h5>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div className="mb-3">
                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
                                    Họ và tên
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={profile.fullName} 
                                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                                    placeholder="Nhập tên hiển thị..." 
                                    style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                            </div>

                            <div className="mb-3">
                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
                                    Địa chỉ Email (Định danh hệ thống)
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={profile.email} 
                                    disabled 
                                    style={{ backgroundColor: '#F9FAFB', cursor: 'not-allowed', borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px', color: '#6B7280' }} 
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
                                    Ngày phân bổ cố định (Ngày T)
                                </label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control" 
                                    value={allocationDateTime} 
                                    onChange={handleDateTimeChange}
                                    style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                                    Xác định ngày chu kỳ tài chính của bạn (Ngày T = <strong>ngày {profile.allocationDay || 1}</strong> hàng tháng, kết thúc vào 23:59 ngày {profile.allocationDay > 1 ? profile.allocationDay - 1 : 'cuối tháng'}). Thu nhập tháng sẽ tự động reset về 0 khi bước sang chu kỳ mới.
                                </div>
                            </div>

                            <button 
                                onClick={handleUpdateProfile}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: '#991B1B',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '9px 20px',
                                    fontSize: '13.5px',
                                    fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#7F1D1D'; }}
                                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#991B1B'; }}
                            >
                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: ĐỔI MẬT KHẨU --- */}
                <div className="col-lg-6">
                    <div 
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                            <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                Thay đổi mật khẩu
                            </h5>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div className="mb-3">
                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
                                    Mật khẩu hiện tại
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    value={passwords.oldPassword}
                                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                    style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                            </div>
                            <div className="mb-3">
                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
                                    Mật khẩu mới
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                    style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                            </div>
                            <div className="mb-4">
                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
                                    Xác nhận mật khẩu mới
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                    style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                            </div>

                            <button 
                                onClick={handleChangePassword}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: '#111827',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '9px 20px',
                                    fontSize: '13.5px',
                                    fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1F2937'; }}
                                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#111827'; }}
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;