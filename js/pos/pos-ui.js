import { currentPriceType, setCurrentPriceType } from "./../pos.js";

export function initPosTabs() {
  const tabSell = document.getElementById("tab-pos-sell");
  const tabHistory = document.getElementById("tab-pos-history");
  const viewSell = document.getElementById("pos-sell-view");
  const viewHistory = document.getElementById("pos-history-view");

  const switchView = (activeTab, inactiveTab, activeView, inactiveView) => {
    activeTab.classList.remove("btn-light");
    activeTab.classList.add("btn-purple", "active");
    inactiveTab.classList.remove("btn-purple", "active");
    inactiveTab.classList.add("btn-light");

    activeView.classList.add("active-view");
    inactiveView.classList.remove("active-view");
  };

  if (tabSell && tabHistory) {
    viewSell.classList.add("active-view");
    viewHistory.classList.remove("active-view");

    tabSell.addEventListener("click", () =>
      switchView(tabSell, tabHistory, viewSell, viewHistory),
    );
    tabHistory.addEventListener("click", () =>
      switchView(tabHistory, tabSell, viewHistory, viewSell),
    );
  }
}

export function initPosFiltersAndToggles(allPosProducts, renderPosProducts) {
  const btnRetail = document.getElementById("price-retail");
  const btnDealer = document.getElementById("price-dealer");
  const searchInput = document.getElementById("pos-search");
  const categorySelect = document.getElementById("pos-category");

  const togglePrice = (type, activeBtn, inactiveBtn) => {
    setCurrentPriceType(type);
    activeBtn.classList.add("btn-purple", "active");
    activeBtn.classList.remove("btn-light");
    inactiveBtn.classList.add("btn-light");
    inactiveBtn.classList.remove("btn-purple", "active");
    renderPosProducts(allPosProducts);
  };

  if (btnRetail && btnDealer) {
    btnRetail.addEventListener("click", () =>
      togglePrice("retail", btnRetail, btnDealer),
    );
    btnDealer.addEventListener("click", () =>
      togglePrice("dealer", btnDealer, btnRetail),
    );
  }

  const filterData = () => {
    const text = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const cat = categorySelect ? categorySelect.value : "all";

    const filtered = allPosProducts.filter((p) => {
      const matchCat = cat === "all" || p.category === cat;
      const matchSearch =
        (p.name && p.name.toLowerCase().includes(text)) ||
        (p.sku && p.sku.toLowerCase().includes(text));
      return matchCat && matchSearch;
    });
    renderPosProducts(filtered);
  };

  if (searchInput) searchInput.addEventListener("input", filterData);
  if (categorySelect) categorySelect.addEventListener("change", filterData);
}