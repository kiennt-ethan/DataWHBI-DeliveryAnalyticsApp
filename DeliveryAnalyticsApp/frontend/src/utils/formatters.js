import { CURRENCIES } from './constants';

// Format số thường (VD: 1,234)
export const formatNum = (val) => new Intl.NumberFormat('en-US').format(val || 0);

// Format số rút gọn cho biểu đồ (VD: 1.2M, 450K)
export const formatCompactNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number || 0);
};

// Format tiền tệ động (VD: 50.000 ₫, $10.50)
export const formatMoney = (val, currencyKey = 'VND') => {
    if (val === undefined || val === null) return "0";

    // Fallback về VND nếu key không tồn tại
    const currency = CURRENCIES[currencyKey] || CURRENCIES['VND'];

    // Nhân giá trị gốc (BRL) với tỷ giá
    const convertedVal = val * currency.rate;

    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyKey === 'BRL' ? 'BRL' : currencyKey, // BRL hiển thị R$ chuẩn
        maximumFractionDigits: 0
    }).format(convertedVal);
};