import { API_URL } from "./config.js";

export async function checkoutOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Lỗi hệ thống khi thanh toán");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi API checkout:", error);
    throw error;
  }
}

export async function fetchInvoices(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    if (filters.keyword) params.append("keyword", filters.keyword);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/invoices?${queryString}`
      : `${API_URL}/invoices`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Lỗi tải danh sách hóa đơn");
    return await res.json();
  } catch (error) {
    console.error("Lỗi fetchInvoices:", error);
    return [];
  }
}
