import { fetchCustomers } from "../api.js";

export function initCustomerSuggest(initialCustomers) {
  let posCustomers = initialCustomers;

  window.addEventListener("refreshCustomers", async () => {
    posCustomers = await fetchCustomers();
  });

  const nameInput = document.getElementById("pos-cus-name");
  const phoneInput = document.getElementById("pos-cus-phone");
  const addressInput = document.getElementById("pos-cus-address");

  if (!nameInput || !phoneInput) return;

  if (!Array.isArray(posCustomers)) {
    posCustomers = [];
  }

  const createSuggestList = (inputEl, type) => {
    let oldUl = inputEl.parentNode.querySelector(".custom-suggest-list");
    if (oldUl) oldUl.remove();

    const ul = document.createElement("ul");
    ul.className = "custom-suggest-list";
    ul.style.cssText =
      "display: none; position: absolute; top: 100%; left: 0; width: 100%; z-index: 99999; margin-top: 4px; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; max-height: 250px; overflow-y: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); padding: 0; list-style: none;";

    inputEl.parentNode.style.position = "relative";
    inputEl.parentNode.appendChild(ul);

    inputEl.addEventListener("input", () => {
      const val = inputEl.value.toLowerCase().trim();

      if (!val) {
        ul.style.display = "none";
        return;
      }

      const matches = posCustomers.filter((c) => {
        const cName = (c.name || "").toLowerCase();
        const cPhone = (c.phone || "").toLowerCase();
        if (type === "name") return cName.includes(val);
        if (type === "phone") return cPhone.includes(val);
        return false;
      });

      if (matches.length > 0) {
        ul.innerHTML = matches
          .map(
            (c) => `
          <li style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f1f5f9; color: #0f172a;" data-id="${c.id}" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
            <div style="font-weight: 600; font-size: 14px;">${c.name || "Chưa có tên"}</div>
            <div style="font-size: 12px; color: #64748b;">SĐT: ${c.phone || "Trống"} ${c.address ? ` - ĐC: ${c.address}` : ""}</div>
          </li>
        `,
          )
          .join("");
        ul.style.display = "block";
      } else {
        ul.style.display = "none";
      }
    });

    ul.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      const cus = posCustomers.find((c) => c.id == li.dataset.id);
      if (cus) {
        nameInput.value = cus.name || "";
        phoneInput.value = cus.phone || "";
        if (addressInput) addressInput.value = cus.address || "";
      }
      ul.style.display = "none";
    });

    document.addEventListener("click", (e) => {
      if (e.target !== inputEl && !ul.contains(e.target)) {
        ul.style.display = "none";
      }
    });
  };

  createSuggestList(nameInput, "name");
  createSuggestList(phoneInput, "phone");
}
