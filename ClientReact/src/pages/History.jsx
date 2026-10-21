import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const History = () => {
    // --- COMPONENT STATE ---
    const [transactions, setTransactions] = useState([]);
    const [jars, setJars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    // BUG-10: Lỗi hiểu sai đặc tả - Cấu hình 10 dòng/trang thay vì 20 dòng/trang (BR-13)
    const pageSize = 10;

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [transRes, jarsRes] = await Promise.all([
                    axios.get('/api/Transactions'),
                    axios.get('/api/Jars')
                ]);
                setTransactions(transRes.data || []);
                
                // Create a map for quick jar name lookup
                const jarsMap = (jarsRes.data || []).reduce((acc, jar) => {
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
                // BUG-11: Lỗi ngoài đặc tả - Sử dụng RegExp trực tiếp với searchTerm không escape
                // Khi người dùng nhập '[', '\', '(', '?', JavaScript ném SyntaxError gây crash toàn bộ trang
                const regex = new RegExp(searchTerm, 'i');
                return regex.test(tx.description || '') || regex.test(jarName);
            });
    }, [transactions, searchTerm, filterType, jars]);

    // Phân trang danh sách giao dịch đã lọc
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(start, start + pageSize);
    }, [filteredTransactions, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
    
    // --- HELPERS ---
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    // --- RENDER ---
    return (
        <div className="container-fluid">
            {/* 1. Header */}
            <header className="mb-4">
                <h2 className="fw-bold mb-0">Lịch sử Giao dịch</h2>
                <p className="text-muted">Theo dõi và quản lý mọi khoản thu chi của bạn.</p>
            </header>

            {/* 2. Filter & Search Controls */}
            <div className="card rounded-4 shadow-sm border-0 mb-4">
                <div className="card-body p-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-lg-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fa-solid fa-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0 ps-0" 
                                    placeholder="Tìm kiếm theo nội dung, tên hũ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                             <div className="btn-group w-100" role="group">
                                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={filterType === 'all'} onChange={() => setFilterType('all')} />
                                <label className="btn btn-outline-secondary" htmlFor="btnradio1">Tất cả</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={filterType === 'income'} onChange={() => setFilterType('income')} />
                                <label className="btn btn-outline-success" htmlFor="btnradio2"><i className="fa-solid fa-arrow-down me-1"></i>Thu nhập</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" checked={filterType === 'expense'} onChange={() => setFilterType('expense')} />
                                <label className="btn btn-outline-danger" htmlFor="btnradio3"><i className="fa-solid fa-arrow-up me-1"></i>Chi tiêu</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Transactions Table */}
            <div className="card rounded-4 shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-borderless mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col" className="p-3">Ngày</th>
                                    <th scope="col" className="p-3">Nội dung</th>
                                    <th scope="col" className="p-3">Hũ chi tiêu</th>
                                    <th scope="col" className="p-3 text-end">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center p-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map(tx => (
                                        <tr key={tx.id} style={{ verticalAlign: 'middle' }}>
                                            <td className="p-3">{formatDate(tx.date)}</td>
                                            <td className="p-3 fw-semibold">{tx.description}</td>
                                            <td className="p-3">
                                                <span className="badge bg-light text-dark rounded-pill">{jars[tx.jarId] || 'Không xác định'}</span>
                                            </td>
                                            <td className={`p-3 fw-bold text-end ${tx.amount < 0 ? 'text-danger' : 'text-success'}`}>
                                                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted p-5">
                                            Không tìm thấy giao dịch nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredTransactions.length > pageSize && (
                        <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ borderColor: '#E5E7EB' }}>
                            <span className="text-muted small">
                                Hiển thị {((currentPage - 1) * pageSize) + 1} – {Math.min(currentPage * pageSize, filteredTransactions.length)} / {filteredTransactions.length} giao dịch (Trang {currentPage}/{totalPages})
                            </span>
                            <div className="btn-group">
                                <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={`btn btn-sm ${currentPage === page ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button 
                                    className="btn btn-sm btn-outline-secondary" 
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
        </div>
    );
};

export default History;
