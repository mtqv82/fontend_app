import { API_URL } from "./config.js";

export async function fetchCustomers() {
  try {
    const res = await fetch(`${API_URL}/customers`);
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function updateCustomerFieldApi(id, field, value) {
  try {
    const res = await fetch(`${API_URL}/customers/${id}/field`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi cập nhật");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerApi(id) {
  try {
    const res = await fetch(`${API_URL}/customers/${id}`, { method: "DELETE" });
    return res.ok;
  } catch (error) {
    return false;
  }
}

export async function addCustomerApi(data) {
  try {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Lỗi thêm khách hàng");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
