import {
  fetchWarranties,
  createWarranty,
  updateWarrantyStatus,
} from "./api.js";

let allWarranties = [];
let isWarrantyEventsAttached = false;

export function initWarrantyPage() {
  loadWarranties();
  if (!isWarrantyEventsAttached) {
    attachWarrantyEvents();
    isWarrantyEventsAttached = true;
  }
}

function showCustomerSuggest(val) {
  const suggestBox = document.getElementById("wr-cus-suggest");
  if (!suggestBox) return;

  const keyword = (val || "").toLowerCase().trim();
  const uniqueCustomers = [];
  const seen = new Set();

  allWarranties.forEach((w) => {
    if (w.customer_name && w.customer_phone) {
      const key = w.customer_phone.trim();
      if (!seen.has(key)) {
        if (
          !keyword ||
          w.customer_name.toLowerCase().includes(keyword) ||
          w.customer_phone.includes(keyword)
        ) {
          seen.add(key);
          uniqueCustomers.push({
            name: w.customer_name,
            phone: w.customer_phone,
          });
        }
      }
    }
  });

  if (uniqueCustomers.length > 0) {
    suggestBox.innerHTML = uniqueCustomers
      .map(
        (c) =>
          `<div class="wr-suggest-item" data-name="${c.name}" data-phone="${c.phone}">
          <strong style="color: #e11d48;"><i class="fa-regular fa-user" style="margin-right:4px;"></i> ${c.name}</strong>
          <span style="color: #64748b; font-size: 12px;"><i class="fa-solid fa-phone" style="font-size: 10px; margin-right:4px;"></i> ${c.phone}</span>
      </div>`,
      )
      .join("");
    suggestBox.style.setProperty("display", "block", "important");
  } else {
    suggestBox.style.setProperty("display", "none", "important");
  }
}

function attachWarrantyEvents() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#btn-add-warranty")) {
      e.preventDefault();
      openWrModal(null);
    }

    if (e.target.closest("#wr-btn-x") || e.target.closest("#wr-btn-cancel")) {
      e.preventDefault();
      const modal = document.getElementById("wr-main-modal");
      if (modal) modal.style.setProperty("display", "none", "important");
    }

    if (e.target.closest(".w-tab")) {
      const tab = e.target.closest(".w-tab");
      document
        .querySelectorAll(".w-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      filterWarranties();
    }

    if (e.target.closest(".btn-edit-warranty")) {
      const btn = e.target.closest(".btn-edit-warranty");
      const id = btn.dataset.id;
      const w = allWarranties.find((x) => x.id == id);
      if (w) openWrModal(w);
    }

    if (e.target.id === "wr-cus-name") {
      showCustomerSuggest(e.target.value);
    }

    const suggestItem = e.target.closest(".wr-suggest-item");
    if (suggestItem) {
      document.getElementById("wr-cus-name").value = suggestItem.dataset.name;
      document.getElementById("wr-cus-phone").value = suggestItem.dataset.phone;
      const suggestBox = document.getElementById("wr-cus-suggest");
      if (suggestBox)
        suggestBox.style.setProperty("display", "none", "important");
    }

    if (!e.target.closest(".wr-autocomplete-wrapper")) {
      const suggestBox = document.getElementById("wr-cus-suggest");
      if (suggestBox)
        suggestBox.style.setProperty("display", "none", "important");
    }
  });

  document.addEventListener("input", (e) => {
    if (
      e.target.id === "warranty-hero-search" ||
      e.target.id === "warranty-search"
    ) {
      const hSearch = document.getElementById("warranty-hero-search");
      const qSearch = document.getElementById("warranty-search");
      if (e.target.id === "warranty-hero-search" && qSearch)
        qSearch.value = hSearch.value;
      else if (e.target.id === "warranty-search" && hSearch)
        hSearch.value = qSearch.value;
      filterWarranties();
    }

    if (e.target.id === "wr-cus-name") {
      showCustomerSuggest(e.target.value);
    }
  });

  document.addEventListener("submit", async (e) => {
    if (e.target.id === "wr-form") {
      e.preventDefault();
      const id = document.getElementById("wr-id")?.value;

      const data = {
        customer_name: document.getElementById("wr-cus-name")?.value,
        customer_phone: document.getElementById("wr-cus-phone")?.value,
        product_name: document.getElementById("wr-product")?.value,
        serial_number: document.getElementById("wr-serial")?.value,
        receive_date: document.getElementById("wr-receive-date")?.value || null,
        return_date: document.getElementById("wr-return-date")?.value || null,
        issue_description: document.getElementById("wr-issue")?.value,
        note: document.getElementById("wr-note")?.value,
        status: document.getElementById("wr-status")?.value,
      };

      try {
        if (id) await updateWarrantyStatus(id, data.status);
        else await createWarranty(data);

        const modal = document.getElementById("wr-main-modal");
        if (modal) modal.style.setProperty("display", "none", "important");
        loadWarranties();
      } catch (err) {
        alert("Lỗi lưu phiếu!");
      }
    }
  });
}

function openWrModal(data = null) {
  const modal = document.getElementById("wr-main-modal");
  if (!modal) return;

  modal.style.setProperty("display", "flex", "important");

  const suggestBox = document.getElementById("wr-cus-suggest");
  if (suggestBox) suggestBox.style.setProperty("display", "none", "important");

  const form = document.getElementById("wr-form");
  if (form) form.reset();

  const fmtD = (d) => {
    if (!d) return "";
    try {
      const parsed = new Date(d);
      return isNaN(parsed) ? "" : parsed.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const title = document.getElementById("wr-title");

  if (data) {
    if (title)
      title.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Cập nhật phiếu: ${data.ticket_code}`;
    document.getElementById("wr-id").value = data.id;
    document.getElementById("wr-cus-name").value = data.customer_name || "";
    document.getElementById("wr-cus-phone").value = data.customer_phone || "";
    document.getElementById("wr-product").value = data.product_name || "";
    document.getElementById("wr-serial").value = data.serial_number || "";
    document.getElementById("wr-receive-date").value = fmtD(data.receive_date);
    document.getElementById("wr-return-date").value = fmtD(data.return_date);
    document.getElementById("wr-issue").value = data.issue_description || "";
    document.getElementById("wr-note").value = data.note || "";
    document.getElementById("wr-status").value = data.status || "Mới tiếp nhận";
  } else {
    if (title)
      title.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Phiếu Tiếp Nhận Bảo Hành`;
    document.getElementById("wr-id").value = "";
  }
}

async function loadWarranties() {
  try {
    allWarranties = (await fetchWarranties()) || [];
  } catch (e) {
    allWarranties = [];
  } finally {
    filterWarranties();
  }
}

function filterWarranties() {
  const txt =
    document.getElementById("warranty-search")?.value.toLowerCase() || "";
  const tab =
    document.querySelector(".w-tab.active")?.getAttribute("data-status") ||
    "all";

  const f = allWarranties.filter((w) => {
    const s = tab === "all" || w.status === tab;
    const t =
      (w.customer_name || "").toLowerCase().includes(txt) ||
      (w.customer_phone || "").includes(txt) ||
      (w.product_name || "").toLowerCase().includes(txt) ||
      (w.serial_number || "").toLowerCase().includes(txt) ||
      (w.ticket_code || "").toLowerCase().includes(txt);
    return s && t;
  });
  renderWarranties(f);
}

function renderWarranties(data) {
  const tb = document.getElementById("warranty-table-body");
  if (!tb) return;
  if (data.length === 0) {
    tb.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không tìm thấy phiếu nào.</td></tr>`;
    return;
  }
  const fd = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "---");
  const bdg = (s) => {
    let c = "ws-new";
    if (s === "Đang xử lý" || s === "Đang sửa chữa") c = "ws-processing";
    else if (s === "Đang gửi hãng") c = "ws-vendor";
    else if (s === "Đã trả khách" || s === "Đã xong") c = "ws-done";
    return `<span class="w-status-badge ${c}">${s}</span>`;
  };

  tb.innerHTML = data
    .map(
      (w) => `
    <tr>
        <td><span class="w-code">${w.ticket_code}</span></td>
        <td><span class="w-text-main">${w.customer_name}</span><span class="w-text-sub">${w.customer_phone}</span></td>
        <td><span class="w-text-main">${w.product_name}</span><span class="w-text-sn">S/N: ${w.serial_number || "---"}</span></td>
        <td><span class="w-error-msg">${w.issue_description}</span><span class="w-text-sub">${w.note || "..."}</span></td>
        <td><span class="w-text-main">Nhận: ${fd(w.receive_date)}</span><span class="w-text-sub">Hẹn: ${fd(w.return_date)}</span></td>
        <td style="text-align: center;">${bdg(w.status)}</td>
        <td style="text-align: center;"><button type="button" class="w-btn-edit btn-edit-warranty" data-id="${w.id}">Sửa</button></td>
    </tr>
  `,
    )
    .join("");
}
