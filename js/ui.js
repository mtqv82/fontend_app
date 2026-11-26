// File: src/js/ui.js
import { loadAndRenderTable } from "./product.js";
import { loadAndRenderCustomers } from "./customer.js";
export function initMenuNavigation() {
  const menuItems = document.querySelectorAll(".menu-item");
  const pages = document.querySelectorAll(".page-section");
  const headerTitle = document.getElementById("header-title");

  menuItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault();

      menuItems.forEach((btn) => btn.classList.remove("active"));
      item.classList.add("active");

      const targetId = item.getAttribute("data-target");
      pages.forEach((page) => {
        if (page.id === targetId) {
          page.classList.add("active");
        } else {
          page.classList.remove("active");
        }
      });

      headerTitle.textContent = item.textContent.trim();

      if (targetId === "page-inventory") {
        await loadAndRenderTable();
      } else if (targetId === "page-customers") {
        await loadAndRenderCustomers();
      }
    });
  });
}

export function initCategoryTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const category = tab.getAttribute("data-cat");
    });
  });
}
