import { initMenuNavigation } from "./ui.js";
import {
  loadAndRenderTable,
  loadCategoriesAndTabs,
  initFilters,
  loadDeleteModal,
  loadInventoryHTML,
} from "./product.js";
import { loadAddProductModal } from "./../js/form/product-add.js";
import { loadExcelModal } from "./excel/product-excel.js";
import { loadCustomerHTML, initCustomerFilters } from "./customer.js";
import { loadCustomerModal } from "./../js/form/customer-add.js";
import { initPosPage } from "./pos.js";
import { initWarrantyPage } from "./warranty.js";
import { loadWarrantyModal } from "./../js/form/warranty-add.js";
import { initSettingsPage } from "./settings.js";

document.addEventListener("DOMContentLoaded", async () => {
  initMenuNavigation();
  await loadInventoryHTML();
  await loadAddProductModal();
  await loadExcelModal();
  await loadDeleteModal();
  await loadCustomerModal();
  await loadWarrantyModal();
  await loadCustomerHTML();
  initCustomerFilters();

  await loadPosHTML();
  await loadWarrantyHTML();

  await loadCategoriesAndTabs();
  initFilters();
  await loadAndRenderTable();

  initSettingsPage();
});

async function loadPosHTML() {
  try {
    const res = await fetch("./components/pos.html");
    const html = await res.text();
    const container = document.getElementById("page-pos");

    if (container) {
      container.innerHTML = html;
      initPosPage();
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadWarrantyHTML() {
  try {
    const res = await fetch("./components/warranty.html");
    if (!res.ok) throw new Error(res.statusText);

    const html = await res.text();
    const container = document.getElementById("page-warranties");

    if (container) {
      container.innerHTML = html;
      initWarrantyPage();
    }
  } catch (error) {
    console.error(error);
  }
}
