import React, { useState } from 'react';
import transactionService from '../services/transactionService';
import { formatCurrency, formatVNDInput, parseVNDInput } from '../common/formatters';
import { showSuccess, showError, showWarning } from '../common/toast';

// =========================================================
// TRANSACTION MODAL (Tầng Components)
// Trách nhiệm: Hiển thị form rút tiền / chi tiêu từ hũ cụ thể
// Khóa chức năng nạp tiền tại hũ (chỉ cho phép rút tiền)
// Định dạng tiền tệ VND: XXX.XXX.XXX,XXX (Ví dụ: 7.000.000,230)
// =========================================================

const TransactionModal = ({ jar, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAmountChange = (e) => {
        setAmount(formatVNDInput(e.target.value));
    };

    const parsedAmount = parseVNDInput(amount);
    const isOverBalance = parsedAmount > (jar.balance || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rawAmount = parseVNDInput(amount);
        if (!amount || rawAmount <= 0 || !description.trim()) {
            return showWarning("Vui lòng nhập đủ thông tin và số tiền hợp lệ!");
        }

        setIsSubmitting(true);
        try {
            // Chi tiêu / Rút tiền từ hũ -> Số Âm
            const finalAmount = -Math.abs(rawAmount);

            const payload = {
                description: description.trim(),
                amount: finalAmount,
                date: new Date().toISOString(),
                jarId: jar.id
            };

            await transactionService.createTransaction(payload);
            showSuccess(`Đã rút ${amount} đ từ hũ "${jar.name}" thành công!`);
            onSuccess();
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || 'Không thể thực hiện giao dịch.';
            showError(errorMsg, "Lỗi rút tiền");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-4">
                    
                    {/* Header: Màu đỏ thương hiệu VJU */}
                    <div 
                        className="modal-header border-0 text-white rounded-top-4"
                        style={{ backgroundColor: '#991B1B' }}
                    >
                        <div>
                            <h5 className="modal-title fw-bold mb-0">
                                <i className="fa-solid fa-arrow-up-from-bracket me-2"></i>
                                Rút tiền / Chi tiêu
                            </h5>
                            <small className="opacity-75">Từ hũ: <strong>{jar.name}</strong></small>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {/* Thông tin số dư hũ */}
                        <div 
                            className="d-flex align-items-center justify-content-between p-3 mb-4 rounded-3" 
                            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                        >
                            <div>
                                <div style={{ fontSize: '12px', color: '#991B1B', fontWeight: 500 }}>
                                    Số dư khả dụng hiện tại
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#991B1B' }}>
                                    {formatCurrency(jar.balance)}
                                </div>
                            </div>
                            <span 
                                className="badge" 
                                style={{ 
                                    backgroundColor: '#991B1B', 
                                    color: '#FFFFFF', 
                                    fontSize: '11px', 
                                    padding: '6px 10px',
                                    borderRadius: '6px'
                                }}
                            >
                                {jar.percent}% phân bổ
                            </span>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Số tiền rút */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '13px' }}>
                                    Số tiền rút (VND) <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="form-control form-control-lg rounded-3 fw-bold text-dark"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    required
                                    autoFocus
                                    style={{ borderColor: isOverBalance ? '#EF4444' : '#E5E7EB' }}
                                />
                                {isOverBalance && (
                                    <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                                        <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                        Số tiền rút đang vượt quá số dư hiện tại của hũ ({formatCurrency(jar.balance)}).
                                    </div>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '13px' }}>
                                    Nội dung chi tiêu <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="VD: Siêu thị mua đồ ăn, Đổ xăng, Mua sách..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    style={{ borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                            </div>

                            {/* Nút bấm */}
                            <div className="d-flex justify-content-end gap-2">
                                <button 
                                    type="button" 
                                    className="btn rounded-3 px-4" 
                                    onClick={onClose}
                                    style={{ 
                                        backgroundColor: '#F3F4F6', 
                                        border: '1px solid #E5E7EB', 
                                        color: '#4B5563', 
                                        fontSize: '13px', 
                                        fontWeight: 500 
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn rounded-3 px-4 fw-bold text-white"
                                    disabled={isSubmitting}
                                    style={{
                                        backgroundColor: '#991B1B',
                                        border: 'none',
                                        fontSize: '13px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TransactionModal;