import { API_URL } from "./config.js";

// -- BẢO HÀNH --
export async function fetchWarranties() {
  try {
    const res = await fetch(`${API_URL}/warranties`);
    if (!res.ok) throw new Error("Lỗi tải danh sách bảo hành");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createWarranty(data) {
  try {
    const res = await fetch(`${API_URL}/warranties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateWarrantyStatus(id, status) {
  try {
    const res = await fetch(`${API_URL}/warranties/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    return false;
  }
}

// -- CÀI ĐẶT CỬA HÀNG --
export async function getSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, { method: "GET" });
    return await res.json();
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateSettings(data) {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    return false;
  }
}
