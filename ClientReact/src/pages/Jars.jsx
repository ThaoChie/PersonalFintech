import React, { useEffect, useState } from 'react';
import { useJarStore } from '../stores/jarStore';
import { useAuthStore } from '../stores/authStore';
import TransactionModal from '../components/TransactionModal'; 
import JarModal from '../components/JarModal'; 
import { formatCurrency } from '../common/formatters'; 

const Jars = () => {
    const { jars, isLoading: loading, fetchJars } = useJarStore();
    const { user, fetchProfile } = useAuthStore();
    
    // State Popup
    const [selectedJar, setSelectedJar] = useState(null); 
    const [showTransModal, setShowTransModal] = useState(false); 
    const [showJarModal, setShowJarModal] = useState(false);     

    useEffect(() => {
        fetchJars();
        if (!user) {
            fetchProfile();
        }
    }, [fetchJars, fetchProfile, user]);

    const calculateDailyBudget = (balance) => {
        if (balance <= 0) return 0;
        const now = new Date();
        const allocationDay = user?.allocationDay || 1;

        if (allocationDay === 1) {
            // BUG-06: Lỗi hiểu sai đặc tả BR-10 - Công thức quên cộng 1 ngày cho hôm nay (lastDayOfMonth - now.getDate())
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            let remainingDays = lastDayOfMonth - now.getDate();
            if (remainingDays <= 0) remainingDays = 1;
            return balance / remainingDays;
        }

        // Mức chi tiêu trên ngày tính = Số dư hũ / Số ngày tính từ ngày hiện tại đến ngày cuối của tháng tài chính (T - 1)
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();

        let targetDate;
        if (currentDay >= allocationDay) {
            // Chu kỳ tài chính kết thúc vào ngày T-1 của tháng sau
            const daysInNextMonth = new Date(currentYear, currentMonth + 2, 0).getDate();
            const endDay = Math.min(allocationDay - 1, daysInNextMonth);
            targetDate = new Date(currentYear, currentMonth + 1, endDay, 23, 59, 59, 999);
        } else {
            // Chu kỳ tài chính kết thúc vào ngày T-1 của tháng này
            const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const endDay = Math.min(allocationDay - 1, daysInCurrentMonth);
            targetDate = new Date(currentYear, currentMonth, endDay, 23, 59, 59, 999);
        }

        const diffTime = targetDate.getTime() - now.getTime();
        let remainingDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return balance / remainingDays;
    };

    const handleTransModal = (jar) => {
        setSelectedJar(jar);
        setShowTransModal(true);
    };

    const handleEditJar = (jar) => {
        setSelectedJar(jar);
        setShowJarModal(true);
    };

    const handleCreateJar = () => {
        setSelectedJar(null); 
        setShowJarModal(true);
    };

    if (loading) return <div className="p-5 text-center">Đang tải danh sách hũ...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                        Quản lý Hũ Chi Tiêu
                    </h2>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                        Chia tiền của bạn vào 6 chiếc hũ thông minh theo phương pháp JARS.
                    </p>
                </div>
                <button 
                    onClick={handleCreateJar}
                    style={{
                        backgroundColor: '#991B1B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7F1D1D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                >
                    <i className="fa-solid fa-plus" style={{ fontSize: '13px' }}></i>
                    <span>Tạo Hũ Mới</span>
                </button>
            </div>

            <div className="row g-4">
                {jars.map((jar) => {
                    const dailyBudget = (user?.allocationDay > 1 && jar.dailyBudget !== undefined) 
                        ? jar.dailyBudget 
                        : calculateDailyBudget(jar.balance);
                    
                    // CÔNG THỨC TÍNH PHẦN TRĂM TIẾN ĐỘ
                    let progressPercent = 0;
                    if (jar.goal > 0) {
                        progressPercent = (jar.balance / jar.goal) * 100;
                    }
                    const visualPercent = Math.min(progressPercent, 100); 

                    return (
                        <div className="col-md-6 col-lg-4" key={jar.id}>
                            <div 
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '20px'
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <span 
                                            style={{
                                                backgroundColor: '#FEF2F2',
                                                color: '#991B1B',
                                                fontSize: '11.5px',
                                                fontWeight: 600,
                                                padding: '3px 10px',
                                                borderRadius: '9999px',
                                                display: 'inline-block',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            {jar.percent || 0}% phân bổ
                                        </span>
                                        <h5 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                            {jar.name}
                                        </h5>
                                    </div>
                                    <button 
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            backgroundColor: '#F9FAFB',
                                            color: '#6B7280',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onClick={() => handleEditJar(jar)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                                            e.currentTarget.style.color = '#111827';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                                            e.currentTarget.style.color = '#6B7280';
                                        }}
                                        title="Chỉnh sửa hũ"
                                    >
                                        <i className="fa-solid fa-pen" style={{ fontSize: '12px' }}></i>
                                    </button>
                                </div>

                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
                                    {formatCurrency(jar.balance)}
                                </div>

                                {/* THANH TIẾN ĐỘ */}
                                <div style={{ height: '6px', borderRadius: '9999px', backgroundColor: '#F3F4F6', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div 
                                        style={{ 
                                            width: `${visualPercent}%`, 
                                            height: '100%', 
                                            backgroundColor: '#991B1B', 
                                            borderRadius: '9999px',
                                            transition: 'width 0.4s ease' 
                                        }} 
                                    />
                                </div>

                                <div className="d-flex justify-content-between" style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
                                    <span>Đã đạt: {progressPercent.toFixed(0)}%</span>
                                    <span>Mục tiêu: {jar.goal > 0 ? formatCurrency(jar.goal) : 'Chưa đặt'}</span>
                                </div>

                                <div 
                                    style={{
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #F3F4F6',
                                        borderRadius: '8px',
                                        padding: '10px 14px',
                                        marginBottom: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa-regular fa-calendar" style={{ color: '#6B7280', fontSize: '13px' }}></i>
                                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#4B5563' }}>Mức chi/ngày:</span>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                                        {formatCurrency(dailyBudget)}
                                    </span>
                                </div>

                                <div className="mt-auto">
                                    <button 
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#FFFFFF',
                                            color: '#991B1B',
                                            border: '1.5px solid #991B1B',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onClick={() => handleTransModal(jar)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-up-from-bracket" style={{ fontSize: '12px' }}></i>
                                        <span>Rút tiền</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showTransModal && selectedJar && (
                <TransactionModal 
                    jar={selectedJar} 
                    onClose={() => setShowTransModal(false)}
                    onSuccess={() => {
                        setShowTransModal(false);
                        fetchJars();
                    }}
                />
            )}

            {showJarModal && (
                <JarModal 
                    jar={selectedJar} 
                    onClose={() => setShowJarModal(false)}
                    onSuccess={() => {
                        setShowJarModal(false);
                        fetchJars();
                    }}
                />
            )}
        </div>
    );
};

export default Jars;