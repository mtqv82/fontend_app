import { fetchCustomers } from "./api.js";
import { renderCustomerTable } from "./customer/customer-ui.js";

let allCustomers = [];
let currentTabType = "all";

// Nạp HTML khung giao diện
export async function loadCustomerHTML() {
  try {
    const res = await fetch("./components/customers.html");
    const html = await res.text();
    const container = document.getElementById("page-customers");
    if (container) container.innerHTML = html;
  } catch (error) {
    console.error("Lỗi tải HTML Khách hàng:", error);
  }
}

// Khởi tạo trang
export async function initCustomerPage() {
  await loadAndRenderCustomers();
  initCustomerFilters();
}

// Tải dữ liệu API
export async function loadAndRenderCustomers() {
  const tbody = document.getElementById("customer-tbody");
  if (tbody) tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Đang tải dữ liệu...</td></tr>';

  allCustomers = await fetchCustomers();
  filterAndRender(); // Gọi hàm lọc thay vì render thẳng để giữ trạng thái tìm kiếm
}

// Hàm Xử lý Lọc dữ liệu & Gọi hàm Render
export function filterAndRender() {
  const activeSearch = document.getElementById("search-customer");
  const text = activeSearch ? activeSearch.value.toLowerCase().trim() : "";

  const filteredData = allCustomers.filter((c) => {
    const matchType = currentTabType === "all" || c.type === currentTabType;

    const name = c.name ? c.name.toLowerCase() : "";
    const phone = c.phone ? String(c.phone) : "";
    const code = c.customer_code ? c.customer_code.toLowerCase() : "";
    const address = c.address ? c.address.toLowerCase() : "";
    const note = c.note ? c.note.toLowerCase() : "";

    const matchSearch = name.includes(text) || phone.includes(text) || code.includes(text) || address.includes(text) || note.includes(text);
    return matchType && matchSearch;
  });

  // Truyền data đã lọc, data gốc, và callback để load lại UI sau khi edit xong
  renderCustomerTable(filteredData, allCustomers, filterAndRender);
}

// Khởi tạo sự kiện Bộ lọc & Tabs
export function initCustomerFilters() {
  const searchInput = document.getElementById("search-customer");
  const tabs = document.querySelector(".customer-tabs");

  if (searchInput) {
    searchInput.addEventListener("input", filterAndRender);
  }

  if (tabs) {
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (btn) {
        tabs.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        currentTabType = btn.getAttribute("data-type");
        filterAndRender(); 
      }
    });
  }
}