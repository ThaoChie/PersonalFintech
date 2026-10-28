import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { showSuccess, showError, showWarning } from '../common/toast';
import jarService from '../services/jarService';
import transactionService from '../services/transactionService';
import { formatCurrency, formatVNDInput, parseVNDInput } from '../common/formatters';

// =========================================================
// GLOBAL TRANSACTION MODAL (Tầng Components)
// Trách nhiệm: Hiển thị form thêm giao dịch toàn cục, nhận props
// Định dạng tiền tệ VND: XXX.XXX.XXX,XXX (Ví dụ: 7.000.000,230)
// =========================================================

const GlobalTransactionModal = ({ show, handleClose, onSaveSuccess }) => {
    const getNowLocalDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        jarId: '',
        type: 'expense',
        date: getNowLocalDateTime()
    });
    const [jars, setJars] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Tải danh sách hũ khi modal mở
    useEffect(() => {
        if (show) {
            const fetchJarsData = async () => {
                try {
                    const jarsData = await jarService.getJars();
                    setJars(jarsData || []);
                    if (jarsData && jarsData.length > 0) {
                        setFormData(prev => ({ ...prev, jarId: jarsData[0].id }));
                    }
                } catch (error) {
                    console.error('[GlobalTransactionModal] Lỗi tải hũ:', error);
                }
            };
            fetchJarsData();
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            setFormData(prev => ({ ...prev, amount: formatVNDInput(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTypeChange = (val) => {
        setFormData({ ...formData, type: val });
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            jarId: jars[0]?.id || '',
            type: 'expense',
            date: getNowLocalDateTime()
        });
    };

    const handleInternalClose = () => {
        resetForm();
        handleClose();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const parsedAmount = parseVNDInput(formData.amount);
        if (!formData.amount || parsedAmount <= 0 || !formData.description) {
            showWarning('Vui lòng điền đầy đủ số tiền hợp lệ và mô tả giao dịch.', 'Thiếu thông tin');
            return;
        }

        // Với chi tiêu bắt buộc phải chọn hũ
        if (formData.type === 'expense' && !formData.jarId) {
            showWarning('Vui lòng chọn hũ tài chính chi trả.', 'Chưa chọn hũ');
            return;
        }

        setIsSaving(true);
        let finalAmount = formData.type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
        
        let transactionDate;
        if (formData.date) {
            const now = new Date();
            const [year, month, day] = formData.date.split('-');
            const dt = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), now.getHours(), now.getMinutes(), now.getSeconds());
            transactionDate = dt.toISOString();
        } else {
            transactionDate = new Date().toISOString();
        }

        const payload = {
            description: formData.description.trim(),
            amount: finalAmount,
            jarId: formData.jarId ? parseInt(formData.jarId) : (jars[0]?.id || 0),
            date: transactionDate
        };

        try {
            await transactionService.createTransaction(payload);
            showSuccess('Giao dịch đã được ghi nhận vào hệ thống.');
            if (onSaveSuccess) onSaveSuccess();
            handleInternalClose();
        } catch (error) {
            const msg = typeof error.response?.data === 'string'
                ? error.response.data
                : error.response?.data?.message || 'Không thể lưu giao dịch.';
            showError(msg, 'Lỗi ghi nhận!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={handleInternalClose} centered size="lg">
            <Modal.Header closeButton style={{ borderBottom: '1px solid #E5E7EB' }}>
                <Modal.Title className="fw-bold" style={{ color: '#8B1D24', fontSize: '18px' }}>
                    <i className="fa-solid fa-plus-minus me-2"></i>
                    Thêm Giao Dịch Nhanh
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSave}>
                <Modal.Body style={{ padding: '24px' }}>
                    <div className="d-flex mb-4 gap-2">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('expense')}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: formData.type === 'expense' ? '#991B1B' : '#E5E7EB',
                                backgroundColor: formData.type === 'expense' ? '#991B1B' : '#FFFFFF',
                                color: formData.type === 'expense' ? '#FFFFFF' : '#4B5563',
                                fontSize: '13.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <i className="fa-solid fa-arrow-up me-2"></i>Chi Tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('income')}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: formData.type === 'income' ? '#111827' : '#E5E7EB',
                                backgroundColor: formData.type === 'income' ? '#111827' : '#FFFFFF',
                                color: formData.type === 'income' ? '#FFFFFF' : '#4B5563',
                                fontSize: '13.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <i className="fa-solid fa-arrow-down me-2"></i>Thu Nhập (Tự động chia 6 hũ)
                        </button>
                    </div>

                    <Form.Group className="mb-3" controlId="txAmount">
                        <Form.Label className="fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>
                            Số tiền (VND) <span style={{ color: '#991B1B' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            inputMode="decimal"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            autoFocus
                            style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="txDescription">
                        <Form.Label className="fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>
                            Mô tả giao dịch <span style={{ color: '#991B1B' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="description"
                            placeholder="Ví dụ: Ăn trưa, Nhận lương, Mua sách..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                        />
                    </Form.Group>

                    {formData.type === 'expense' && (
                        <Form.Group className="mb-3" controlId="txJar">
                            <Form.Label className="fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>
                                Trừ từ hũ <span style={{ color: '#991B1B' }}>*</span>
                            </Form.Label>
                            <Form.Select
                                name="jarId"
                                value={formData.jarId}
                                onChange={handleChange}
                                required
                                style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                            >
                                {jars.map(jar => (
                                    <option key={jar.id} value={jar.id}>
                                        {jar.name} ({jar.percent}% - Số dư: {formatCurrency(jar.balance)})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3" controlId="txDate">
                        <Form.Label className="fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>
                            Ngày ghi nhận <span style={{ color: '#991B1B' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: '8px', borderColor: '#E5E7EB', fontSize: '13.5px' }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #E5E7EB', padding: '16px 24px' }}>
                    <button 
                        type="button" 
                        onClick={handleInternalClose} 
                        style={{
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        style={{
                            backgroundColor: '#991B1B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: isSaving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu giao dịch'}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default GlobalTransactionModal;