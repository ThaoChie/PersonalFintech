import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jarService from '../services/jarService';
import transactionService from '../services/transactionService';
import dashboardService from '../services/dashboardService';
import { formatCurrency, formatDateTime } from '../common/formatters';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Đăng ký thành phần biểu đồ
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Bảng màu tối giản chuẩn E-Form: Đỏ VJU, Đen Than, Xám trung tính
const CHART_COLORS = ['#991B1B', '#111827', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'];

const Dashboard = ({ onOpenGlobalModal }) => {
    // --- STATE DỮ LIỆU ---
    const [stats, setStats] = useState({ totalAssets: 0, income: 0, expense: 0 });
    const [jars, setJars] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [reportPeriod, setReportPeriod] = useState('day'); // 'day', 'week', 'month'
    const [isLoading, setIsLoading] = useState(true);

    // --- STATE BIỂU ĐỒ LINE ---
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });

    // 1. LOAD DỮ LIỆU
    const fetchData = async () => {
        try {
            const [jarsData, transactions, dashData] = await Promise.all([
                jarService.getJars(),
                transactionService.getTransactions(),
                dashboardService.getSummary()
            ]);

            setJars(jarsData || []);
            // BUG-05: Lấy danh sách giao dịch gần nhất từ API Dashboard (đã bị sắp xếp OrderBy tăng dần)
            setRecentTransactions(dashData?.recentTransactions || transactions || []);
            setAllTransactions(transactions || []);

            // Tính toán thống kê theo chu kỳ tài chính (MonthIncome tự reset về 0 tại 23h59 ngày T-1)
            const totalJarsBalance = (jarsData || []).reduce((acc, jar) => acc + jar.balance, 0);

            setStats({
                totalAssets: dashData?.totalBalance ?? totalJarsBalance,
                income: dashData?.monthIncome ?? 0,
                expense: Math.abs(dashData?.monthExpense ?? 0)
            });

            processLineChart(transactions || [], reportPeriod);

        } catch (err) {
            console.error("Lỗi tải data Dashboard:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Lắng nghe sự kiện lưu giao dịch từ Global Modal để reload dữ liệu tức thì
        const handleRefresh = () => fetchData();
        window.addEventListener('transaction-saved', handleRefresh);
        return () => window.removeEventListener('transaction-saved', handleRefresh);
    }, []);

    // 2. XỬ LÝ BIỂU ĐỒ BÁO CÁO THU CHI (NGÀY / TUẦN / THÁNG)
    const processLineChart = (transactions, period = reportPeriod) => {
        const sortedTrans = [...(transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dataMap = {};

        if (period === 'day') {
            // Gom nhóm theo từng ngày: DD/MM
            sortedTrans.forEach(t => {
                const date = new Date(t.date).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
                if (!dataMap[date]) dataMap[date] = { income: 0, expense: 0 };
                if (t.amount > 0) dataMap[date].income += t.amount;
                else dataMap[date].expense += Math.abs(t.amount);
            });
        } else if (period === 'week') {
            // Gom nhóm theo tuần: Tuần 1, Tuần 2, Tuần 3, Tuần 4, Tuần 5
            sortedTrans.forEach(t => {
                const d = new Date(t.date);
                const weekNum = Math.min(5, Math.ceil(d.getDate() / 7));
                const weekKey = `Tuần ${weekNum} (T${d.getMonth() + 1})`;
                if (!dataMap[weekKey]) dataMap[weekKey] = { income: 0, expense: 0 };
                if (t.amount > 0) dataMap[weekKey].income += t.amount;
                else dataMap[weekKey].expense += Math.abs(t.amount);
            });
        } else if (period === 'month') {
            // Gom nhóm theo tháng: T1/2026, T2/2026,...
            sortedTrans.forEach(t => {
                const d = new Date(t.date);
                const monthKey = `T${d.getMonth() + 1}/${d.getFullYear()}`;
                if (!dataMap[monthKey]) dataMap[monthKey] = { income: 0, expense: 0 };
                if (t.amount > 0) dataMap[monthKey].income += t.amount;
                else dataMap[monthKey].expense += Math.abs(t.amount);
            });
        }

        let labels = Object.keys(dataMap);

        // Hiển thị nhãn mặc định sạch sẽ nếu chưa có giao dịch
        if (labels.length === 0) {
            if (period === 'day') {
                const today = new Date().toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
                labels = [today];
                dataMap[today] = { income: 0, expense: 0 };
            } else if (period === 'week') {
                labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
                labels.forEach(l => { dataMap[l] = { income: 0, expense: 0 }; });
            } else if (period === 'month') {
                const currentMonth = `T${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
                labels = [currentMonth];
                dataMap[currentMonth] = { income: 0, expense: 0 };
            }
        }

        const maxDisplay = period === 'day' ? 14 : period === 'week' ? 8 : 12;
        const displayLabels = labels.length > maxDisplay ? labels.slice(-maxDisplay) : labels;
        const incomeData = displayLabels.map(k => dataMap[k]?.income || 0);
        const expenseData = displayLabels.map(k => dataMap[k]?.expense || 0);

        setLineChartData({
            labels: displayLabels,
            datasets: [
                {
                    label: 'Thu Nhập',
                    data: incomeData,
                    borderColor: '#111827', 
                    backgroundColor: 'rgba(17, 24, 39, 0.05)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Chi Tiêu',
                    data: expenseData,
                    borderColor: '#991B1B', 
                    backgroundColor: 'rgba(153, 27, 27, 0.08)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                }
            ]
        });
    };

    // 3. XỬ LÝ BIỂU ĐỒ TRÒN
    const doughnutData = {
        labels: jars.map(j => j.name),
        datasets: [
            {
                data: jars.map(j => j.balance),
                backgroundColor: CHART_COLORS,
                borderWidth: 0,
                hoverOffset: 6
            }
        ]
    };

    // Helpers
    const formatDate = (dateString) => dateString ? formatDateTime(dateString) : '';

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* --- PAGE HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                        Tổng quan Quản lý Tài chính
                    </h2>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                        Theo dõi phân bổ 6 chiếc hũ và tiến độ tài chính cá nhân.
                    </p>
                </div>

                {/* 1 BUTTON DUY NHẤT ĐƯỢC GIỮ LẠI (MÀU ĐỎ VJU) */}
                <div>
                    <button 
                        onClick={onOpenGlobalModal}
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
                        <span>Thêm giao dịch</span>
                    </button>
                </div>
            </div>

            {/* --- 4 STATS CARDS THEO CHUẨN E-FORM (MŨI TÊN CHÉO ↗) --- */}
            <div className="row g-3 mb-4">
                {/* CARD 1: TỔNG SỐ DƯ */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div 
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Tổng số dư</span>
                            <span style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1 }}>↗</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                            {formatCurrency(stats.totalAssets)}
                        </div>
                    </div>
                </div>

                {/* CARD 2: THU NHẬP THÁNG */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div 
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>
                                Thu nhập tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                            </span>
                            <span style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1 }}>↗</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                            {formatCurrency(stats.income)}
                        </div>
                    </div>
                </div>

                {/* CARD 3: CHI TIÊU THÁNG */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div 
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>
                                Chi tiêu tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                            </span>
                            <span style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1 }}>↗</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#991B1B' }}>
                            {formatCurrency(stats.expense)}
                        </div>
                    </div>
                </div>

                {/* CARD 4: SỐ HŨ QUẢN LÝ */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div 
                        style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Số hũ quản lý</span>
                            <span style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1 }}>↗</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                            {jars.length} Hũ
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ACTION BANNER CARD (PHONG CÁCH "YÊU CẦU CHỜ DUYỆT" CỦA E-FORM) --- */}
            <div 
                className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3"
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '18px 24px'
                }}
            >
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                        Phân bổ 6 hũ thông minh
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Hiện có {jars.length} hũ đang hoạt động. Điều chỉnh tỷ lệ phần trăm phân bổ ngân sách theo nhu cầu thực tế.
                    </div>
                </div>
                <Link
                    to="/jars"
                    style={{
                        backgroundColor: '#991B1B',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7F1D1D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                >
                    <span>Quản lý Hũ</span>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }}></i>
                </Link>
            </div>

            {/* --- CHARTS SECTION (TỐI GIẢN: ĐỎ / ĐEN / XÁM) --- */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div 
                        style={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E5E7EB', 
                            borderRadius: '12px', 
                            height: '100%',
                            padding: '20px 24px'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-3">
                                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#111827', margin: 0 }}>
                                    Biến động Thu Chi
                                </h3>
                                {/* BỘ LỌC BÁO CÁO THEO NGÀY / TUẦN / THÁNG */}
                                <div 
                                    style={{
                                        display: 'inline-flex',
                                        backgroundColor: '#F3F4F6',
                                        padding: '2px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {[
                                        { id: 'day', label: 'Ngày' },
                                        { id: 'week', label: 'Tuần' },
                                        { id: 'month', label: 'Tháng' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setReportPeriod(tab.id);
                                                processLineChart(allTransactions, tab.id);
                                            }}
                                            style={{
                                                border: 'none',
                                                backgroundColor: reportPeriod === tab.id ? '#991B1B' : 'transparent',
                                                color: reportPeriod === tab.id ? '#FFFFFF' : '#4B5563',
                                                fontWeight: reportPeriod === tab.id ? 600 : 500,
                                                fontSize: '11.5px',
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-3" style={{ fontSize: '12px' }}>
                                <span className="d-flex align-items-center gap-1 text-muted">
                                    <span style={{ width: '10px', height: '10px', backgroundColor: '#111827', borderRadius: '2px' }}></span>
                                    Thu nhập
                                </span>
                                <span className="d-flex align-items-center gap-1 text-muted">
                                    <span style={{ width: '10px', height: '10px', backgroundColor: '#991B1B', borderRadius: '2px' }}></span>
                                    Chi tiêu
                                </span>
                            </div>
                        </div>
                        <div style={{ height: '280px', width: '100%' }}>
                            <Line 
                                data={lineChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: '#F3F4F6', borderDash: [4, 4] } },
                                        x: { grid: { display: false } }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div 
                        style={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E5E7EB', 
                            borderRadius: '12px', 
                            height: '100%',
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                            Phân bổ Tài sản theo Hũ
                        </h3>
                        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                            <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                                <Doughnut 
                                    data={doughnutData} 
                                    options={{
                                        responsive: true,
                                        cutout: '72%',
                                        plugins: { legend: { display: false } }
                                    }} 
                                />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Tổng số</div>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{jars.length} Hũ</div>
                                </div>
                            </div>
                            
                            <div className="mt-3 w-100 overflow-auto" style={{ maxHeight: '140px' }}>
                                {jars.map((jar, index) => (
                                    <div key={jar.id} className="d-flex justify-content-between align-items-center py-1 px-1">
                                        <div className="d-flex align-items-center gap-2">
                                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                                            <span style={{ fontSize: '12.5px', color: '#374151' }}>{jar.name}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
                                            {((jar.balance / (stats.totalAssets || 1)) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RECENT TRANSACTIONS (BẢNG GIAO DỊCH GẦN NHẤT) --- */}
            <div 
                style={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            >
                <div 
                    style={{ 
                        padding: '16px 24px', 
                        borderBottom: '1px solid #E5E7EB', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}
                >
                    <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#111827', margin: 0 }}>
                        Giao dịch gần nhất
                    </h3>
                    <Link 
                        to="/history" 
                        style={{ 
                            fontSize: '12.5px', 
                            fontWeight: 600, 
                            color: '#991B1B', 
                            textDecoration: 'none' 
                        }}
                    >
                        Xem tất cả →
                    </Link>
                </div>
                <div className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#F9FAFB' }}>
                                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 24px' }}>Nội dung</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 16px' }}>Ngày</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 24px', textAlign: 'right' }}>Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* BUG-05: Giữ nguyên logic hiển thị 5 giao dịch gần nhất */}
                                {recentTransactions.slice(0, 5).map((tx, idx) => (
                                    <tr key={tx.id || idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '12px 24px' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div 
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: tx.amount < 0 ? '#FEF2F2' : '#F3F4F6',
                                                        color: tx.amount < 0 ? '#991B1B' : '#111827',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    <i className={`fa-solid ${tx.amount < 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                                                        {tx.description}
                                                    </span>
                                                    <span style={{ fontSize: '11.5px', color: tx.amount > 0 ? '#111827' : '#6B7280', fontWeight: tx.amount > 0 ? 600 : 400 }}>
                                                        {tx.amount > 0 ? 'Thu nhập' : (jars.find(j => j.id === tx.jarId)?.name || 'Chi tiêu')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                                            {formatDate(tx.date)}
                                        </td>
                                        <td 
                                            style={{ 
                                                padding: '12px 24px', 
                                                fontSize: '13.5px', 
                                                fontWeight: 700, 
                                                textAlign: 'right',
                                                color: tx.amount < 0 ? '#991B1B' : '#111827'
                                            }}
                                        >
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '36px', color: '#9CA3AF', fontSize: '13px' }}>
                                            Chưa có giao dịch nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;