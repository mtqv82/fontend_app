export function exportInvoicesToCsv(rows) {
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
