// =========================================================
// SYSTEM MESSAGES & TEXTS (Tầng Common)
// Trách nhiệm: Lưu trữ thông điệp, nhãn hiển thị và câu thông báo
// KHÔNG làm: Không import từ pages/
// =========================================================

export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Đăng nhập thành công!',
        LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
        REGISTER_SUCCESS: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.',
        REGISTER_FAILED: 'Đăng ký tài khoản thất bại.',
        LOGOUT_CONFIRM: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
        UPDATE_PROFILE_SUCCESS: 'Cập nhật hồ sơ cá nhân thành công!',
        CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công!'
    },
    JARS: {
        CREATE_SUCCESS: 'Tạo hũ tài chính mới thành công!',
        UPDATE_SUCCESS: 'Cập nhật thông tin hũ thành công!',
        DELETE_SUCCESS: 'Xóa hũ tài chính thành công!',
        DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa hũ này cùng toàn bộ giao dịch liên quan?'
    },
    TRANSACTIONS: {
        CREATE_SUCCESS: 'Ghi nhận giao dịch thành công!',
        CREATE_FAILED: 'Ghi nhận giao dịch thất bại.'
    },
    ERRORS: {
        NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc backend.',
        UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        UNKNOWN: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    }
};
