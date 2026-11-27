import { fetchProducts, fetchCustomers } from "./api.js";
import { initCheckout } from "./pos/pos-checkout.js";
import { initPosHistory } from "./pos/pos-history.js";
import { initPosTabs, initPosFiltersAndToggles } from "./../js/pos/pos-ui.js";
import {
  initCartEvents,
  renderCart,
  cart,
  addToCart,
} from "./../js/pos/pos-cart.js";
import { initCustomerSuggest } from "./../js/pos/pos-customer.js";

let allPosProducts = [];
export let currentPriceType = "retail";

export async function initPosPage() {
  initPosTabs();
  
  await loadPosProducts(); 
  
  initPosFiltersAndToggles(allPosProducts, renderPosProducts);
  
  initCartEvents();
  initPosHistory();

  const posCustomers = await fetchCustomers();
  initCustomerSuggest(posCustomers);

  initCheckout(
    () => cart,
    () => {
      cart.length = 0;
      renderCart();
    },
  );
}

async function loadPosProducts() {
  const grid = document.getElementById("pos-product-list");
  if (grid)
    grid.innerHTML =
      '<div class="empty-state">Đang tải danh sách linh kiện...</div>';

  allPosProducts = await fetchProducts();
  const inStockProducts = allPosProducts.filter((p) => p.stock > 0);
  renderPosProducts(inStockProducts);
}

export function renderPosProducts(data) {
  const grid = document.getElementById("pos-product-list");
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML =
      '<div class="empty-state" style="width:100%; text-align:center;">Không tìm thấy linh kiện nào!</div>';
    return;
  }

  grid.innerHTML = "";
  data.forEach((p) => {
    let displayPrice =
      currentPriceType === "retail"
        ? Number(p.retail_price) || 0
        : Number(p.dealer_price) || 0;
    let priceLabel = currentPriceType === "retail" ? "Giá lẻ:" : "Giá thợ:";

    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = p.id;

    card.innerHTML = `
      <div class="pc-meta">
          <span class="pc-sku">${p.sku}</span>
          <span class="pc-stock">Tồn kho: ${p.stock}</span>
      </div>
      <div class="pc-name" title="${p.name}">${p.name}</div>
      <div class="pc-action">
          <div class="pc-price-box">
              <span class="pc-price-label">${priceLabel}</span>
              <span class="pc-price-val">${displayPrice.toLocaleString("vi-VN")} ₫</span>
          </div>
          <button class="btn-add-item"><i class="fa-solid fa-plus"></i></button>
      </div>
    `;

    card.addEventListener("click", () => addToCart(p, displayPrice));
    grid.appendChild(card);
  });
}

window.addEventListener("refreshPosProducts", loadPosProducts);

export function setCurrentPriceType(type) {
  currentPriceType = type;
}