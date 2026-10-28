import Swal from 'sweetalert2';

// =========================================================
// TOAST NOTIFICATION SERVICE (Tầng Common)
// Cấu hình Toast chuẩn 5 giây theo yêu cầu người dùng:
// - Vị trí: Góc trên bên phải (top-end)
// - Thời gian hiển thị: 5000ms (5 giây)
// - Có thanh tiến trình đếm ngược thời gian (timerProgressBar: true)
// - Tạm dừng khi rê chuột vào (hover) và chạy tiếp khi rời chuột
// - Tuyệt đối không dùng alert() hay popup modal chặn thao tác
// =========================================================

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    showCloseButton: true,
    didOpen: (toastEl) => {
        toastEl.onmouseenter = Swal.stopTimer;
        toastEl.onmouseleave = Swal.resumeTimer;
    }
});

/**
 * Hiển thị thông báo Lỗi dạng Toast 5 giây
 * @param {string} message - Nội dung lỗi
 * @param {string} [title] - Tiêu đề lỗi
 */
export const showError = (message, title = 'Đã có lỗi xảy ra') => {
    return Toast.fire({
        icon: 'error',
        title: title,
        text: message || 'Vui lòng kiểm tra lại thao tác hoặc thử lại sau.'
    });
};

/**
 * Hiển thị thông báo Thành công dạng Toast 5 giây
 * @param {string} message - Nội dung thành công
 * @param {string} [title] - Tiêu đề
 */
export const showSuccess = (message, title = 'Thành công') => {
    return Toast.fire({
        icon: 'success',
        title: title,
        text: message || 'Thao tác đã được thực hiện thành công.'
    });
};

/**
 * Hiển thị thông báo Cảnh báo dạng Toast 5 giây
 * @param {string} message - Nội dung cảnh báo
 * @param {string} [title] - Tiêu đề
 */
export const showWarning = (message, title = 'Cảnh báo') => {
    return Toast.fire({
        icon: 'warning',
        title: title,
        text: message
    });
};

/**
 * Hiển thị thông tin dạng Toast 5 giây
 * @param {string} message - Nội dung thông tin
 * @param {string} [title] - Tiêu đề
 */
export const showInfo = (message, title = 'Thông báo') => {
    return Toast.fire({
        icon: 'info',
        title: title,
        text: message
    });
};

/**
 * Thay thế cho window.confirm() bằng dialog xác nhận thanh lịch
 * @param {object} options
 * @param {string} options.title - Tiêu đề xác nhận
 * @param {string} options.text - Chi tiết câu hỏi
 * @param {string} [options.confirmButtonText] - Chữ trên nút xác nhận
 * @param {string} [options.cancelButtonText] - Chữ trên nút hủy
 * @returns {Promise<boolean>} - true nếu người dùng bấm xác nhận
 */
export const showConfirm = async ({
    title = 'Bạn có chắc chắn?',
    text = '',
    confirmButtonText = 'Đồng ý',
    cancelButtonText = 'Hủy bỏ'
}) => {
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#991B1B',
        cancelButtonColor: '#6B7280',
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true
    });
    return result.isConfirmed;
};

export default {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConfirm
};
