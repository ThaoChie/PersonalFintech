import React, { useState, useEffect } from 'react';
import jarService from '../services/jarService';
import { formatVNDInput, parseVNDInput } from '../common/formatters';
import { showSuccess, showError, showConfirm } from '../common/toast';

// =========================================================
// JAR MODAL COMPONENT (Tầng Components)
// Trách nhiệm: Hiển thị form tạo mới/chỉnh sửa hũ, nhận props
// Định dạng tiền tệ VND: XXX.XXX.XXX,XXX (Ví dụ: 7.000.000,230)
// Toàn bộ thông báo lỗi chuyển thành Toast 5 giây (không dùng alert)
// =========================================================

const JarModal = ({ jar, onClose, onSuccess }) => {
    const isEditMode = !!jar;

    const [formData, setFormData] = useState({
        name: '',
        percent: 0,
        goal: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEditMode && jar) {
            setFormData({
                name: jar.name,
                percent: jar.percent || 0,
                goal: jar.goal ? formatVNDInput(jar.goal) : ''
            });
        }
    }, [jar, isEditMode]);

    // Xử lý nhập tiền có định dạng chuẩn VND (dấu chấm hàng nghìn, dấu phẩy thập phân)
    const handleMoneyChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: formatVNDInput(value) }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                percent: parseFloat(formData.percent) || 0,
                goal: formData.goal ? parseVNDInput(formData.goal) : 0,
                id: isEditMode ? jar.id : 0
            };

            if (isEditMode) {
                await jarService.updateJar(jar.id, payload);
                showSuccess('Cập nhật hũ thành công!');
            } else {
                await jarService.createJar({ ...payload, balance: 0 });
                showSuccess('Tạo hũ mới thành công!');
            }
            onSuccess();
        } catch (err) {
            const errMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message;
            showError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'Xóa hũ tài chính',
            text: 'Bạn có chắc chắn muốn xóa hũ này không? Thao tác này không thể hoàn tác.',
            confirmButtonText: 'Xóa ngay'
        });

        if (confirmed) {
            try {
                await jarService.deleteJar(jar.id);
                showSuccess('Đã xóa hũ thành công!');
                onSuccess();
            } catch (err) {
                const errMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message;
                showError(errMsg, 'Lỗi xóa hũ');
            }
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-4">
                    <div className="modal-header border-0 pb-0 pt-4 px-4">
                        <h5 className="modal-title fw-bold" style={{ color: '#991B1B', fontSize: '17px' }}>
                            {isEditMode ? `Chỉnh sửa hũ: ${jar.name}` : 'Tạo thêm Hũ mới'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>Tên Hũ</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VD: Nuôi mèo, Mua xe..."
                                    required
                                    style={{ borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>Tỷ lệ phân bổ (%)</label>
                                <input
                                    type="number"
                                    className="form-control rounded-3"
                                    name="percent"
                                    value={formData.percent}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    required
                                    style={{ borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                />
                                <small className="text-muted" style={{ fontSize: '11.5px' }}>Tổng tỷ lệ của các hũ nên bằng 100%.</small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#374151' }}>Mục tiêu tiết kiệm (VNĐ)</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        className="form-control rounded-3"
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleMoneyChange}
                                        style={{ borderColor: '#E5E7EB', fontSize: '13.5px' }}
                                    />
                                    <span className="input-group-text rounded-3 ms-1 bg-light text-muted">đ</span>
                                </div>
                                <small className="text-muted" style={{ fontSize: '11.5px' }}>Để trống hoặc 0 nếu không đặt mục tiêu.</small>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0 px-4 pb-4 d-flex justify-content-between">
                            {isEditMode ? (
                                <button
                                    type="button"
                                    style={{
                                        color: '#991B1B',
                                        backgroundColor: '#FEF2F2',
                                        border: '1px solid #FEE2E2',
                                        borderRadius: '8px',
                                        padding: '7px 14px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                    onClick={handleDelete}
                                >
                                    <i className="fa-solid fa-trash me-2"></i>Xóa hũ
                                </button>
                            ) : <div></div>}

                            <div className="d-flex gap-2">
                                <button 
                                    type="button" 
                                    style={{
                                        backgroundColor: '#F3F4F6',
                                        color: '#4B5563',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '7px 16px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                    onClick={onClose}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        backgroundColor: '#991B1B',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '7px 18px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JarModal;