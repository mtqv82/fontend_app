import { attachCustomerDoubleEdit } from "./customer-edit.js";
import { initCustomerHistoryEventInList } from "./customer-history.js";

export function renderCustomerTable(filteredData, allData, refreshCallback) {
  const tbody = document.getElementById("customer-tbody");
  if (!tbody) return;

  const total = filteredData.length;
  const dealers = filteredData.filter((c) => c.type === "Khách thợ").length;
  const retails = filteredData.filter((c) => c.type === "Khách lẻ").length;

  document.getElementById("total-customers").textContent = `${total} khách hàng`;
  document.getElementById("total-dealers").textContent = `${dealers} khách thợ / đại lý`;
  document.getElementById("total-retail").textContent = `${retails} khách lẻ`;
  document.getElementById("showing-customers").textContent = `${total} / ${allData.length}`;

  if (total === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Không tìm thấy khách hàng nào!</td></tr>';
    return;
  }

  tbody.innerHTML = filteredData.map((c, index) => {
    const badgeClass = c.type === "Khách lẻ" ? "badge-retail" : "badge-dealer";
    const icon = c.type === "Khách lẻ" ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-tools"></i>';

    return `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${c.customer_code}</strong></td>
            <td class="editable-cell" data-id="${c.id}" data-field="name" title="Nhấp đúp để sửa"><strong>${c.name}</strong></td>
            <td class="editable-cell" style="color: #2563eb; font-weight: 500;" data-id="${c.id}" data-field="phone" title="Nhấp đúp để sửa">${c.phone}</td>
            <td class="editable-cell" data-id="${c.id}" data-field="type" title="Nhấp đúp để sửa"><span class="badge ${badgeClass}">${icon} ${c.type}</span></td>
            <td class="editable-cell" data-id="${c.id}" data-field="address" title="Nhấp đúp để sửa">${c.address || ""}</td>
            <td class="editable-cell" data-id="${c.id}" data-field="note" title="Nhấp đúp để sửa"><span style="color: #64748b;">${c.note || ""}</span></td>
            <td><strong>${Number(c.total_spent || 0).toLocaleString("vi-VN")} ₫</strong></td>
            <td>
                <button class="btn-history btn-view-cus-history" data-phone="${c.phone}">
                    ${c.order_count || 0} đơn <i class="fa-solid fa-eye"></i>
                </button>
            </td>
        </tr>
    `;
  }).join("");

  attachCustomerDoubleEdit(allData, refreshCallback);
  initCustomerHistoryEventInList();
}