import { updateCustomerFieldApi } from "./../api.js";
import { showCustomAlert } from "./../alert.js";

// Hàm render bảng khách hàng
export function renderCustomerTable(filteredData, allData, refreshCallback) {
  const tbody = document.getElementById("customer-tbody");
  if (!tbody) return;

  // Tính toán Thống kê dựa trên danh sách đang hiển thị
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

  // Đổ dữ liệu ra bảng
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
            <td><strong>${Number(c.total_spent).toLocaleString("vi-VN")} ₫</strong></td>
            <td><button class="btn-history">${c.order_count} đơn <i class="fa-solid fa-eye"></i></button></td>
        </tr>
    `;
  }).join("");

  // Gọi hàm gắn sự kiện sửa cho các ô vừa tạo
  attachCustomerDoubleEdit(allData, refreshCallback);
}

// Hàm gắn sự kiện nhấp đúp (Double click)
function attachCustomerDoubleEdit(allData, refreshCallback) {
  document.querySelectorAll("#customer-tbody .editable-cell").forEach((cell) => {
    cell.addEventListener("dblclick", function () {
      if (this.querySelector("input") || this.querySelector("select")) return;

      const id = this.getAttribute("data-id");
      const field = this.getAttribute("data-field");
      const customer = allData.find((c) => c.id == id);
      if (!customer) return;

      const rawValue = customer[field] || "";
      this.innerHTML = "";

      // 1. Ô Select (Phân loại)
      if (field === "type") {
        const select = document.createElement("select");
        select.className = "inline-edit-input";
        select.style.width = "100%";
        select.innerHTML = `
            <option value="Khách lẻ" ${rawValue === "Khách lẻ" ? "selected" : ""}>Khách lẻ</option>
            <option value="Khách thợ" ${rawValue === "Khách thợ" ? "selected" : ""}>Khách thợ</option>
        `;
        this.appendChild(select);
        select.focus();

        const saveType = async () => {
          if (select.value === rawValue) return refreshCallback();
          const res = await updateCustomerFieldApi(id, field, select.value);
          if (res.success) {
            customer[field] = select.value;
            showCustomAlert("Cập nhật phân loại thành công!", "success");
          } else {
            showCustomAlert(res.error, "error");
          }
          refreshCallback();
        };

        select.addEventListener("blur", saveType);
        select.addEventListener("change", saveType);
        return;
      }

      // 2. Ô Input Text (Tên, SĐT, Địa chỉ...)
      const input = document.createElement("input");
      input.type = "text";
      input.value = rawValue;
      input.className = "inline-edit-input";
      input.style.width = "100%";

      this.appendChild(input);
      input.focus();
      input.select();

      let isSaving = false;
      const saveEdit = async () => {
        if (isSaving) return;
        isSaving = true;
        const newValue = input.value.trim();

        if (newValue == rawValue) return refreshCallback();

        input.disabled = true;
        const res = await updateCustomerFieldApi(id, field, newValue);

        if (res.success) {
          customer[field] = newValue;
          showCustomAlert("Cập nhật thành công!", "success");
        } else {
          showCustomAlert(res.error, "error");
        }
        refreshCallback();
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") refreshCallback();
      });
      input.addEventListener("blur", saveEdit);
    });
  });
}