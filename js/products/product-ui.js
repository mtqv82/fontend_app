import { updateProductFieldApi } from "../api.js";
import { showCustomAlert } from "../alert.js";
import { allProducts } from "../product.js";
import { openDeleteModal } from "./product-delete.js";
import { initPosPage } from "../pos.js"
export function renderTableData(productsToRender) {
  const tbody = document.getElementById("inventory-tbody");
  const totalSpan = document.getElementById("total-items");

  if (totalSpan) totalSpan.textContent = productsToRender.length;
  if (!tbody) return;

  if (productsToRender.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="14" class="empty-state">Không tìm thấy sản phẩm nào!</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  productsToRender.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="editable-cell" data-id="${p.id}" data-field="name" title="Nhấp đúp để sửa">${p.name}</td>
           <td class="editable-cell" data-id="${p.id}" data-field="serial_numbers" style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Nhấp đúp để sửa S/N">${p.serial_numbers || "N/A"}</td>
            <td class="editable-cell" data-id="${p.id}" data-field="category" title="Nhấp đúp để sửa">${p.category}</td>
            <td class="editable-cell" data-id="${p.id}" data-field="brand" title="Nhấp đúp để sửa">${p.brand}</td>
            <td class="editable-cell" style="color: ${p.item_condition && p.item_condition.includes("Mới") ? "#00b074" : "#e67e22"}" data-id="${p.id}" data-field="item_condition" title="Nhấp đúp để sửa">• ${p.item_condition || p.condition}</td>
            <td class="editable-cell" data-id="${p.id}" data-field="stock" title="Nhấp đúp để sửa"><strong>${p.stock}</strong></td>
            <td class="editable-cell" data-id="${p.id}" data-field="cost_price" title="Nhấp đúp để sửa">${Number(p.cost_price).toLocaleString("vi-VN")}</td>
            <td class="editable-cell" style="color: #2980b9; font-weight: 500;" data-id="${p.id}" data-field="dealer_price" title="Nhấp đúp để sửa">${Number(p.dealer_price).toLocaleString("vi-VN")}</td> 
            <td class="editable-cell" style="color: #e74c3c; font-weight: bold;" data-id="${p.id}" data-field="retail_price" title="Nhấp đúp để sửa">${Number(p.retail_price).toLocaleString("vi-VN")}</td>
            <td class="editable-cell" data-id="${p.id}" data-field="warranty" title="Nhấp đúp để sửa">${p.warranty}</td>
            <td class="editable-cell" data-id="${p.id}" data-field="note" title="Nhấp đúp để sửa"><span style="color: #888; font-style: italic;">${p.note || ""}</span></td>
            <td><button class="btn btn-red btn-delete" data-id="${p.id}" title="Xóa"><i class="fa-solid fa-trash"></i></button></td>
        `;
    tbody.appendChild(tr);
  });

  attachDeleteEvents();
  attachDoubleEditEvents();
}

function attachDoubleEditEvents() {
  document.querySelectorAll(".editable-cell").forEach((cell) => {
    cell.addEventListener("dblclick", function () {
      if (this.querySelector("input")) return;

      const productId = this.getAttribute("data-id");
      const fieldName = this.getAttribute("data-field");

      const product = allProducts.find((p) => p.id == productId);
      if (!product) return;

      let rawValue =
        product[fieldName] !== null && product[fieldName] !== undefined
          ? product[fieldName]
          : "";
      if (fieldName === "item_condition")
        rawValue = product.item_condition || product.condition || "";

      this.innerHTML = "";
      const input = document.createElement("input");
      input.type = "text";
      input.value = rawValue;
      input.className = "inline-edit-input";
      input.style.width = "100%";
      input.style.boxSizing = "border-box";

      this.appendChild(input);
      input.focus();
      input.select();

      let isSaving = false;
      const saveEdit = async () => {
        if (isSaving) return;
        isSaving = true;

        let newValue = input.value.trim();

        if (
          newValue === "" &&
          ["cost_price", "dealer_price", "retail_price", "stock"].includes(
            fieldName,
          )
        ) {
          newValue = "0";
        }

        if (newValue == rawValue) {
          renderTableData(allProducts);
          return;
        }

        input.disabled = true;

        if (await updateProductFieldApi(productId, fieldName, newValue)) {
          if (
            ["cost_price", "dealer_price", "retail_price", "stock"].includes(
              fieldName,
            )
          ) {
            product[fieldName] = newValue.replace(/\D/g, "");
          } else if (fieldName === "item_condition") {
            product.item_condition = newValue;
          } else {
            product[fieldName] = newValue;
          }
          showCustomAlert("Cập nhật thành công!", "success");
          if (typeof initPosPage === "function") initPosPage();
        } else {
          showCustomAlert("Lỗi lưu dữ liệu!", "error");
        }

        renderTableData(allProducts);
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") {
          isSaving = true;
          renderTableData(allProducts);
        }
      });
      input.addEventListener("blur", saveEdit);
    });
  });
}

function attachDeleteEvents() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      openDeleteModal(parseInt(this.getAttribute("data-id")));
    });
  });
}
