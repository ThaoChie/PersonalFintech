// =========================================================
// CURRENCY & NUMBER FORMATTERS (Tầng Common)
// Chuẩn định dạng tiền tệ VND: XXX.XXX.XXX,XXX (Ví dụ: 7.000.000,230)
// - Dấu chấm (.) phân cách hàng nghìn
// - Dấu phẩy (,) phân cách phần thập phân
// =========================================================

/**
 * Định dạng số thành chuỗi tiền tệ VND chuẩn Việt Nam:
 * Ví dụ: 7000000.23 -> "7.000.000,23 ₫"
 *        7000000    -> "7.000.000 ₫"
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return showSymbol ? '0 ₫' : '0';
    }
    const num = Number(amount);
    const formatted = new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    }).format(num);
    return showSymbol ? `${formatted} ₫` : formatted;
};

/**
 * Định dạng chuỗi người dùng nhập trong input theo chuẩn VND (XXX.XXX.XXX,XXX)
 * Tự động chèn dấu chấm (.) phân cách hàng nghìn khi gõ, cho phép dấu phẩy (,) cho phần thập phân
 * Hỗ trợ chuyển đổi phím chấm (.) trên numpad thành dấu phẩy (,)
 * Ví dụ:
 *   "5000000"     -> "5.000.000"
 *   "7000000,"    -> "7.000.000,"
 *   "7000000,230" -> "7.000.000,230"
 *   "7000000.230" -> "7.000.000,230"
 */
export const formatVNDInput = (value) => {
    if (value === null || value === undefined || value === '') return '';

    // Nếu truyền vào là số (number từ API / props)
    if (typeof value === 'number') {
        if (Number.isInteger(value)) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        } else {
            const [intStr, decStr] = value.toString().split('.');
            const formattedInt = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return `${formattedInt},${(decStr || '').slice(0, 3)}`;
        }
    }

    let str = value.toString().trim();

    // Nếu người dùng gõ dấu chấm (.) ở cuối mà chưa có dấu phẩy, chuyển thành dấu phẩy thập phân
    if (str.endsWith('.') && !str.includes(',')) {
        str = str.slice(0, -1) + ',';
    }

    // Trường hợp có dấu phẩy: phần trước dấu phẩy là phần nguyên, sau là phần thập phân
    if (str.includes(',')) {
        const parts = str.split(',');
        const intClean = parts[0].replace(/\D/g, '');
        const decClean = parts.slice(1).join('').replace(/\D/g, '').slice(0, 3);

        const formattedInt = intClean ? intClean.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';

        // Nếu người dùng vừa gõ dấu phẩy ở cuối (ví dụ "7.000.000,")
        if (parts.length > 1 && decClean === '' && str.endsWith(',')) {
            return `${formattedInt},`;
        }
        return `${formattedInt},${decClean}`;
    }

    // Không có dấu phẩy: Toàn bộ là số nguyên, loại bỏ các dấu chấm cũ rồi format lại hàng nghìn
    const intClean = str.replace(/\D/g, '');
    if (!intClean) return '';
    return intClean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Chuyển chuỗi định dạng VND ("7.000.000,230") thành số float (7000000.23) để gửi API
 */
export const parseVNDInput = (formattedValue) => {
    if (formattedValue === null || formattedValue === undefined || formattedValue === '') return 0;
    const cleanStr = formattedValue.toString().replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
};

/**
 * Định dạng chuỗi ngày giờ đầy đủ (DateTime) gồm cả ngày, tháng, năm và giờ:phút
 * Ví dụ: "2026-10-24T14:30:00Z" -> "24/10/2026 14:30"
 */
export const formatDateTime = (dateString, includeSeconds = false) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    if (includeSeconds) {
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};
