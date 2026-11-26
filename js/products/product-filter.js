import { fetchCategories, fetchBrands } from "../api.js";
import { allProducts } from "../product.js";
import { renderTableData } from "./product-ui.js";

export let allCategories = [];
export let allBrands = [];

export async function loadCategoriesAndTabs() {
  allCategories = await fetchCategories();
  allBrands = await fetchBrands();

  const tabsContainer = document.querySelector(".category-tabs");
  if (tabsContainer) {
    tabsContainer.innerHTML =
      '<button class="tab-btn active" data-cat="all">Tất cả</button>';
    allCategories.forEach(
      (c) =>
        (tabsContainer.innerHTML += `<button class="tab-btn" data-cat="${c.name}">${c.name}</button>`),
    );
  }

  const categorySelect = document.getElementById("add-category");
  if (categorySelect) {
    categorySelect.innerHTML = "";
    allCategories.forEach(
      (c) =>
        (categorySelect.innerHTML += `<option value="${c.name}">${c.name}</option>`),
    );
  }

  setupAutocomplete("brand-filter", "brand-list-filter", allBrands);
  setupAutocomplete("add-brand", "brand-list-add", allBrands);
}

function setupAutocomplete(inputId, listId, dataArray) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  const renderList = (filterText) => {
    list.innerHTML = "";
    const filtered = dataArray.filter((item) =>
      item.name.toLowerCase().includes(filterText.toLowerCase()),
    );

    if (filtered.length === 0) {
      list.style.display = "none";
      return;
    }

    filtered.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.name;

      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = item.name;
        list.style.display = "none";
        input.dispatchEvent(new Event("input"));
      });

      list.appendChild(li);
    });
    list.style.display = "block";
  };

  input.addEventListener("focus", () => renderList(input.value));
  input.addEventListener("input", () => renderList(input.value));

  input.addEventListener("blur", () => {
    setTimeout(() => {
      list.style.display = "none";
    }, 150);
  });
}

export function initFilters() {
  const searchInput = document.getElementById("search-inventory");
  const brandInput = document.getElementById("brand-filter");
  const tabsContainer = document.querySelector(".category-tabs");

  let currentCategory = "all";

  const filterProducts = () => {
    const searchText = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";
    const selectedBrand = brandInput
      ? brandInput.value.toLowerCase().trim()
      : "";

    const filtered = allProducts.filter((p) => {
      const matchCategory =
        currentCategory === "all" || p.category === currentCategory;
      const matchBrand =
        selectedBrand === "" ||
        (p.brand && p.brand.toLowerCase().includes(selectedBrand));
      const matchSearch =
        p.name.toLowerCase().includes(searchText) ||
        p.sku.toLowerCase().includes(searchText);

      return matchCategory && matchBrand && matchSearch;
    });

    renderTableData(filtered);
  };

  if (searchInput) searchInput.addEventListener("input", filterProducts);
  if (brandInput) brandInput.addEventListener("input", filterProducts);

  if (tabsContainer) {
    tabsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-btn")) {
        document
          .querySelectorAll(".tab-btn")
          .forEach((t) => t.classList.remove("active"));
        e.target.classList.add("active");

        currentCategory = e.target.getAttribute("data-cat");
        filterProducts();
      }
    });
  }
}
