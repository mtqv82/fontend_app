import { fetchInvoices } from "./api.js";

let currentInvoiceRows = [];

export function initPosHistory() {
  const tabHistory = document.getElementById("tab-pos-history");
  const filterBtn = document.querySelector("#pos-history-view button.btn-light");
  const searchInput = document.querySelector('#pos-history-view input[type="text"]');
  const dateInputs = document.querySelectorAll('#pos-history-view input[type="date"]');
  const exportBtn = document.querySelector("#pos-history-view .btn-green, #pos-history-view button[class*='excel']");

  const fromDateInput = dateInputs[0] || null;
  const toDateInput = dateInputs[1] || null;

  const loadHistory = async () => {
    const tbody = document.querySelector("#pos-history-view tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="16" style="text-align:center; padding: 24px; color:#64748b;">Đang tải danh sách hóa đơn...</td></tr>`;
    }

    const filters = {
      fromDate: fromDateInput?.value || "",
      toDate: toDateInput?.value || "",
      keyword: searchInput?.value.trim() || "",
    };

    currentInvoiceRows = await fetchInvoices(filters);
    renderInvoiceTable(currentInvoiceRows);
  };

  if (tabHistory) {
    tabHistory.addEventListener("click", loadHistory);
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", loadHistory);
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadHistory, 250);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => exportInvoicesToCsv(currentInvoiceRows));
  }

  window.addEventListener("refreshInvoiceHistory", loadHistory);
}

function renderInvoiceTable(rows) {
  const tbody = document.querySelector("#pos-history-view tbody");
  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="16" style="text-align:center; padding: 24px; color:#94a3b8;">Chưa có hóa đơn nào phù hợp!</td></tr>`;
    return;
  }

  const fmtMoney = (n) => (Number(n) || 0).toLocaleString("vi-VN");
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  };

  tbody.innerHTML = rows
    .map((r) => {
      const qty = Number(r.qty) || 0;
      const price = Number(r.price) || 0;
      const cost = Number(r.cost_price) || 0;
      const lineTotal = price * qty;
      const discount = Number(r.discount) || 0;
      const remaining = Math.max(lineTotal - discount, 0);
      const profit = (price - cost) * qty - discount;
      const itemDesc = r.serials
        ? `${r.product_name} (S/N: ${r.serials})`
        : r.product_name;

      return `
      <tr>
        <td>${fmtDate(r.created_at)}</td>
        <td><strong>${r.customer_name || "Khách lẻ"}</strong></td>
        <td>${r.customer_phone || ""}</td>
        <td>${r.customer_address || ""}</td>
        <td>${r.category || ""}</td>
        <td>${itemDesc || ""}</td>
        <td style="text-align:center;">${qty}</td>
        <td style="text-align:right;">${fmtMoney(price)}</td>
        <td style="text-align:right;">${fmtMoney(lineTotal)}</td>
        <td style="text-align:right;">${discount > 0 ? fmtMoney(discount) : "0"}</td>
        <td style="text-align:right; font-weight:600;">${fmtMoney(remaining)}</td>
        <td style="text-align:center;">${r.warranty || ""}</td>
        <td>${r.invoice_note || ""}</td>
        <td style="text-align:right;">0</td>
        <td style="text-align:right;">${fmtMoney(cost * qty)}</td>
        <td style="text-align:right; font-weight:600; color:${profit >= 0 ? "#16a34a" : "#dc2626"};">${fmtMoney(profit)}</td>
      </tr>
    `;
    })
    .join("");
}

function exportInvoicesToCsv(rows) {
  if (!rows || rows.length === 0) {
    alert("Không có dữ liệu hóa đơn để xuất!");
    return;
  }

  const headers = [
    "NGÀY XUẤT",
    "KHÁCH HÀNG",
    "SĐT",
    "ĐỊA CHỈ",
    "LOẠI HH",
    "HÀNG HOÁ",
    "ĐVT",
    "ĐƠN GIÁ",
    "THÀNH TIỀN",
    "KM/ NHẬP LẠI",
    "CÒN LẠI",
    "BẢO HÀNH",
    "GHI CHÚ",
    "CÔNG NỢ",
    "SX",
    "CL",
  ];

  const escapeCsv = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => {
      const qty = Number(r.qty) || 0;
      const price = Number(r.price) || 0;
      const cost = Number(r.cost_price) || 0;
      const lineTotal = price * qty;
      const discount = Number(r.discount) || 0;
      const remaining = Math.max(lineTotal - discount, 0);
      const profit = (price - cost) * qty - discount;
      const itemDesc = r.serials
        ? `${r.product_name} (S/N: ${r.serials})`
        : r.product_name;

      return [
        new Date(r.created_at).toLocaleDateString("vi-VN"),
        r.customer_name || "Khách lẻ",
        r.customer_phone || "",
        r.customer_address || "",
        r.category || "",
        itemDesc || "",
        qty,
        price,
        lineTotal,
        discount,
        remaining,
        r.warranty || "",
        r.invoice_note || "",
        0,
        cost * qty,
        profit,
      ]
        .map(escapeCsv)
        .join(",");
    }),
  ];

  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hoa-don-quoc-vuong-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}