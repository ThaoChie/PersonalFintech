import React, { useState, useEffect, useMemo } from 'react';
import transactionService from '../services/transactionService';
import jarService from '../services/jarService';
import { formatCurrency, formatDateTime } from '../common/formatters';

const History = () => {
    // --- COMPONENT STATE ---
    const [transactions, setTransactions] = useState([]);
    const [jars, setJars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

    // State phân trang
    // BUG-10: Lỗi hiểu sai đặc tả - Cấu hình 10 dòng/trang thay vì 20 dòng/trang (BR-13)
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [transData, jarsData] = await Promise.all([
                    transactionService.getTransactions(),
                    jarService.getJars()
                ]);
                setTransactions(transData || []);
                
                // Create a map for quick jar name lookup
                const jarsMap = (jarsData || []).reduce((acc, jar) => {
                    acc[jar.id] = jar.name;
                    return acc;
                }, {});
                setJars(jarsMap);

            } catch (error) {
                console.error("Lỗi tải lịch sử giao dịch:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- FILTERING LOGIC ---
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => {
                // Filter by type (income/expense)
                if (filterType === 'income') return tx.amount > 0;
                if (filterType === 'expense') return tx.amount < 0;
                return true;
            })
            .filter(tx => {
                if (!searchTerm) return true;
                const jarName = jars[tx.jarId] || '';
                const categoryName = tx.amount > 0 ? 'Thu nhập' : jarName;
                // BUG-11: Lỗi ngoài đặc tả - Sử dụng RegExp trực tiếp với searchTerm không escape
                // Khi người dùng nhập '[', '\', '(', '?', JavaScript ném SyntaxError gây crash toàn bộ trang
                const regex = new RegExp(searchTerm, 'i');
                return regex.test(tx.description || '') || regex.test(categoryName) || regex.test(jarName);
            });
    }, [transactions, searchTerm, filterType, jars]);

    // Phân trang danh sách giao dịch đã lọc
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(start, start + pageSize);
    }, [filteredTransactions, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;

    // --- RENDER ---
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* 1. Header */}
            <header className="mb-4">
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                    Lịch sử Giao dịch
                </h2>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    Theo dõi và tra cứu chi tiết mọi biến động số dư theo các hũ chi tiêu.
                </p>
            </header>

            {/* 2. Filter & Search Controls */}
            <div 
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px'
                }}
            >
                <div className="row g-3 align-items-center">
                    <div className="col-lg-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#E5E7EB', color: '#9CA3AF' }}>
                                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '13px' }}></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="Tìm kiếm theo nội dung, tên hũ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ borderColor: '#E5E7EB', fontSize: '13.5px', boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFilterType('all')}
                                style={{
                                    flex: 1,
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: filterType === 'all' ? '#111827' : '#E5E7EB',
                                    backgroundColor: filterType === 'all' ? '#111827' : '#FFFFFF',
                                    color: filterType === 'all' ? '#FFFFFF' : '#4B5563',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                Tất cả
                            </button>

                            <button
                                type="button"
                                onClick={() => setFilterType('income')}
                                style={{
                                    flex: 1,
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: filterType === 'income' ? '#111827' : '#E5E7EB',
                                    backgroundColor: filterType === 'income' ? '#111827' : '#FFFFFF',
                                    color: filterType === 'income' ? '#FFFFFF' : '#4B5563',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <i className="fa-solid fa-arrow-down me-1" style={{ fontSize: '11px' }}></i>
                                Thu nhập
                            </button>

                            <button
                                type="button"
                                onClick={() => setFilterType('expense')}
                                style={{
                                    flex: 1,
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: filterType === 'expense' ? '#991B1B' : '#E5E7EB',
                                    backgroundColor: filterType === 'expense' ? '#991B1B' : '#FFFFFF',
                                    color: filterType === 'expense' ? '#FFFFFF' : '#4B5563',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <i className="fa-solid fa-arrow-up me-1" style={{ fontSize: '11px' }}></i>
                                Chi tiêu
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Transactions Table */}
            <div 
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            >
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#F9FAFB' }}>
                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 20px' }}>Ngày</th>
                                <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 20px' }}>Nội dung</th>
                                <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 20px' }}>Hũ chi tiêu</th>
                                <th style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', padding: '12px 20px', textAlign: 'right' }}>Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-5">
                                        <div className="spinner-border" style={{ color: '#991B1B' }} role="status"></div>
                                    </td>
                                </tr>
                            ) : paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map(tx => (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                                            {formatDateTime(tx.date)}
                                        </td>
                                        <td style={{ padding: '12px 20px', fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                                            {tx.description}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            {tx.amount > 0 ? (
                                                <span 
                                                    style={{
                                                        backgroundColor: '#F3F4F6',
                                                        color: '#111827',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #E5E7EB',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    <i className="fa-solid fa-arrow-down" style={{ fontSize: '10px', color: '#111827' }}></i>
                                                    Thu nhập
                                                </span>
                                            ) : (
                                                <span 
                                                    style={{
                                                        backgroundColor: '#F9FAFB',
                                                        color: '#4B5563',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #F3F4F6'
                                                    }}
                                                >
                                                    {jars[tx.jarId] || 'Thiết yếu'}
                                                </span>
                                            )}
                                        </td>
                                        <td 
                                            style={{ 
                                                padding: '12px 20px', 
                                                fontSize: '13.5px', 
                                                fontWeight: 700, 
                                                textAlign: 'right',
                                                color: tx.amount < 0 ? '#991B1B' : '#111827'
                                            }}
                                        >
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '13px' }}>
                                        Không tìm thấy giao dịch nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredTransactions.length > pageSize && (
                    <div 
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 20px',
                            borderTop: '1px solid #E5E7EB',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12.5px',
                            color: '#6B7280'
                        }}
                    >
                        <span>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} – {Math.min(currentPage * pageSize, filteredTransactions.length)} / {filteredTransactions.length} giao dịch (Trang {currentPage}/{totalPages})
                        </span>
                        <div className="btn-group">
                            <button 
                                style={{
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: '#FFFFFF',
                                    color: '#4B5563',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    borderRadius: '6px 0 0 6px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                                Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}
                                    style={{
                                        border: '1px solid',
                                        borderColor: currentPage === page ? '#991B1B' : '#E5E7EB',
                                        backgroundColor: currentPage === page ? '#991B1B' : '#FFFFFF',
                                        color: currentPage === page ? '#FFFFFF' : '#4B5563',
                                        padding: '4px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                style={{
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: '#FFFFFF',
                                    color: '#4B5563',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    borderRadius: '0 6px 6px 0',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
