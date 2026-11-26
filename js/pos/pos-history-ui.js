export function renderInvoiceTable(rows) {
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
