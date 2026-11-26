import { fetchInvoices } from "./../api.js";
import { renderInvoiceTable } from "./pos-history-ui.js";
import { exportInvoicesToCsv } from "./pos-history-export.js";

let currentInvoiceRows = [];

export function initPosHistory() {
  const tabHistory = document.getElementById("tab-pos-history");
  const filterBtn = document.querySelector(
    "#pos-history-view button.btn-light",
  );
  const searchInput = document.querySelector(
    '#pos-history-view input[type="text"]',
  );
  const dateInputs = document.querySelectorAll(
    '#pos-history-view input[type="date"]',
  );
  const exportBtn = document.querySelector(
    "#pos-history-view .btn-green, #pos-history-view button[class*='excel']",
  );

  const fromDateInput = dateInputs[0] || null;
  const toDateInput = dateInputs[1] || null;

  const loadHistory = async () => {
    const tbody = document.querySelector("#pos-history-view tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="16" style="text-align:center; padding: 24px; color:#64748b;">Đang tải danh sách hóa đơn...</td></tr>`;
    }

    const filters = {
      fromDate: fromDateInput?.value || "",
      toDate: toDateInput?.value || "",
      keyword: searchInput?.value.trim() || "",
    };

    currentInvoiceRows = await fetchInvoices(filters);
    renderInvoiceTable(currentInvoiceRows);
  };

  if (tabHistory) {
    tabHistory.addEventListener("click", loadHistory);
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", loadHistory);
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadHistory, 250);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () =>
      exportInvoicesToCsv(currentInvoiceRows),
    );
  }

  window.addEventListener("refreshInvoiceHistory", loadHistory);
}
