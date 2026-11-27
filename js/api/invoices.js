import { API_URL } from "./config.js";

export async function fetchCustomerHistory(phone) {
  try {
    const res = await fetch(`${API_URL}/invoices/history?phone=${phone}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy lịch sử KH:", error);
    return [];
  }
}

export async function fetchInvoiceDetail(id) {
  try {
    const res = await fetch(`${API_URL}/invoices/${id}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy chi tiết HĐ:", error);
    return [];
  }
}