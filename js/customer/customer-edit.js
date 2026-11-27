import { updateCustomerFieldApi } from "./../api.js";
import { showCustomAlert } from "./../alert.js";

export function attachCustomerDoubleEdit(allData, refreshCallback) {
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