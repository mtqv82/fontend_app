import { fetchProducts } from "./api.js";
import { renderTableData } from "./products/product-ui.js";
import { loadDeleteModal } from "./products/product-delete.js";
import {
  loadCategoriesAndTabs,
  initFilters,
  allCategories,
} from "./products/product-filter.js";

export let allProducts = [];
export const getAllCategories = () => allCategories;

export async function loadAndRenderTable() {
  const tbody = document.getElementById("inventory-tbody");
  if (tbody)
    tbody.innerHTML =
      '<tr><td colspan="14" class="empty-state">Đang tải dữ liệu...</td></tr>';

  allProducts = await fetchProducts();
  renderTableData(allProducts);
}
export async function loadInventoryHTML() {
  try {
    const res = await fetch("./components/inventory.html");
    const html = await res.text();
    const container = document.getElementById("page-inventory");
    if (container) container.innerHTML = html;
  } catch (error) {
    console.error("Lỗi tải HTML Kho Hàng:", error);
  }
}

export { loadDeleteModal, loadCategoriesAndTabs, initFilters };
