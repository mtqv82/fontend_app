import { renderSales } from "./sales/sales-ui.js";

export let sales = [];

export async function loadSalesFromDB() {
  try {
    const res = await fetch(`${API_URL}/sales`);
    sales = await res.json();
    renderSales();
  } catch (err) {
    console.error("Lỗi tải sổ bán hàng:", err);
  }
}

export async function addBlankSaleRow() {
  const dateStr = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
  const newRow = {
    date: dateStr,
    customer: "",
    phone: "",
    address: "",
    category: "",
    product: "",
    unit: "c",
    qty: 1,
    price: 0,
    total: 0,
    discount: 0,
    remaining: 0,
    warranty: "",
    note: "",
    debt: "TM",
    sx: "",
    profit: 0,
  };

  try {
    const response = await fetch(`${API_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([newRow]),
    });
    if (response.ok) {
      loadSalesFromDB();
    }
  } catch (err) {
    showToast("Lỗi kết nối máy chủ MySQL!", "error");
  }
}

export async function deleteSale(id) {
  if (!confirm("Xóa dòng doanh thu này?")) return;

  try {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      showToast("Đã xóa dòng doanh thu.", "success");
      loadSalesFromDB();
    }
  } catch (err) {
    showToast("Lỗi kết nối máy chủ!", "error");
  }
}

export async function saveSaleCell(id, field, newValue) {
  let s = sales.find((x) => x.id === id);
  if (!s) return;

  if (
    ["qty", "price", "total", "discount", "remaining", "profit"].includes(field)
  ) {
    s[field] = Number(newValue) || 0;
  } else {
    s[field] = String(newValue).trim();
  }

  if (["qty", "price", "discount"].includes(field)) {
    s.total = s.qty * s.price;
    s.remaining = s.total - s.discount;
  }

  renderSales();

  try {
    await fetch(`${API_URL}/sales/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
  } catch (err) {
    showToast("Lỗi đồng bộ với máy chủ MySQL!", "error");
  }
}

window.deleteSale = deleteSale;
window.saveSaleCell = saveSaleCell;
