import { addProductApi } from "../api.js";
import { showCustomAlert } from "../alert.js";
import { loadAndRenderTable, getAllCategories } from "../product.js";
import { initPosPage } from "../pos.js";

export async function loadAddProductModal() {
  try {
    const response = await fetch("./components/modal-add.html");
    const html = await response.text();
    document.getElementById("modal-container").innerHTML = html;
    initAddProductModal();
  } catch (error) {
    console.error("Lỗi khi tải Modal Thêm SP:", error);
  }
}

function generateSKU(categoryName) {
  const allCategories = getAllCategories();
  const cat = allCategories.find((c) => c.name === categoryName);
  const prefix = cat ? cat.prefix : "SP";
  return `${prefix}-${Date.now().toString().slice(-5)}`;
}

function initAddProductModal() {
  const modal = document.getElementById("modal-add-product");
  const btnOpenModal = document.getElementById("btn-add-product");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");
  const btnSubmitAdd = document.getElementById("btn-submit-add");
  const form = document.getElementById("form-add-product");

  const skuInput = document.getElementById("add-sku");
  const categorySelect = document.getElementById("add-category");

  if (btnOpenModal) {
    btnOpenModal.addEventListener("click", () => {
      form.reset();
      if (categorySelect) skuInput.value = generateSKU(categorySelect.value);
      modal.classList.add("active");
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      skuInput.value = generateSKU(categorySelect.value);
    });
  }

  const closeModal = () => modal.classList.remove("active");
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

  if (btnSubmitAdd) {
    btnSubmitAdd.addEventListener("click", async () => {
      const snRaw = document.getElementById("add-sn").value.trim();
      const snList = snRaw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s !== "");

      let stockCount =
        parseInt(document.getElementById("add-stock").value) || 0;
      if (snList.length > 0) stockCount = snList.length;

      const newProduct = {
        sku: skuInput.value.trim(),
        name: document.getElementById("add-name").value.trim(),
        serial_numbers: snList,
        category: categorySelect ? categorySelect.value : "",
        brand: document.getElementById("add-brand").value.trim(),
        condition: document.getElementById("add-condition").value,
        stock: stockCount,
        costPrice: document.getElementById("add-cost").value.trim(),
        dealerPrice: document.getElementById("add-dealer").value.trim(),
        retailPrice: document.getElementById("add-retail").value.trim(),
        warranty: document.getElementById("add-warranty").value.trim(),
        note: document.getElementById("add-note").value.trim(),
      };

      if (!newProduct.sku || !newProduct.name || !newProduct.retailPrice) {
        showCustomAlert(
          "Vui lòng nhập đầy đủ Mã SKU, Tên sản phẩm và Giá lẻ!",
          "warning",
        );
        return;
      }

      const success = await addProductApi(newProduct);
      if (success) {
        closeModal();
        loadAndRenderTable();
        initPosPage();
        showCustomAlert("Đã lưu sản phẩm mới thành công!", "success");
      } else {
        showCustomAlert("Có lỗi xảy ra khi thêm sản phẩm!", "error");
      }
    });
  }
}
