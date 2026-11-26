import { showCustomAlert } from "../alert.js";

export let cart = [];

export function initCartEvents() {
  document
    .getElementById("cart-vat-check")
    ?.addEventListener("change", updateCartTotals);
  document
    .getElementById("cart-discount")
    ?.addEventListener("input", updateCartTotals);

  //   document.getElementById("btn-clear-cart")?.addEventListener("click", () => {
  //     if (confirm("Bạn có chắc chắn muốn xóa hết sản phẩm trong đơn?")) {
  //       cart = [];
  //       renderCart();
  //     }
  //   });
}

export function addToCart(product, salePrice) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    if (existingItem.qty < product.stock) {
      existingItem.qty += 1;
    } else {
      showCustomAlert(
        `Sản phẩm "${product.name}" chỉ còn tối đa ${product.stock} trong kho!`,
      );
    }
  } else {
    const costPrice = Number(product.capital_price) || 0;

    let rawSerials = product.serial_numbers || "";
    if (rawSerials === "null" || rawSerials === "undefined") rawSerials = "";

    cart.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: salePrice,
      cost: costPrice,
      qty: 1,
      stock: product.stock,
      serial_note: "",
      available_serials: String(rawSerials),
      warranty: "",
    });
  }

  renderCart();
}

export function renderCart() {
  const cartBody = document.getElementById("pos-cart-body");
  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-arrow-down fa-3x" style="color: #cbd5e1; margin-bottom: 15px;"></i>
                <p>Chưa có sản phẩm nào trong giỏ hàng</p>
                <small style="color: #94a3b8;">Nhấp vào linh kiện bên trái để thêm vào đơn</small>
            </div>
        `;
    updateCartTotals();
    return;
  }

  cartBody.innerHTML = "";
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
            <div class="ci-header">
                <span class="ci-name">${index + 1}. ${item.name}</span>
                <button class="ci-remove" title="Xóa"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <div class="ci-body">
                <div class="ci-price-group" title="Bạn có thể sửa giá trực tiếp">
                    <input type="text" class="ci-input-price" value="${item.price.toLocaleString("vi-VN")}" min="0">
                </div>
                
                <div class="ci-qty-group">
                    <button class="ci-btn btn-minus">-</button>
                    <input type="number" class="ci-qty" value="${item.qty}" min="1" max="${item.stock}">
                    <button class="ci-btn btn-plus">+</button>
                </div>
                
                <div class="ci-total">${itemTotal.toLocaleString("vi-VN")} ₫</div>
            </div>
            
            <div class="ci-footer" style="display: flex; gap: 10px; position: relative;">
                <div style="flex: 1; position: relative;">
                    <input type="text" class="ci-input-serial" autocomplete="off" value="${item.serial_note}" placeholder="Nhập Serial (S/N) hoặc ghi chú...">
                    <ul class="custom-suggest-list sn-suggest-list" style="display: none; top: 100%; position: absolute; width: 100%; z-index: 10; margin-top: 4px;"></ul>
                </div>
                <input type="text" class="ci-input-warranty" value="${item.warranty || ""}" placeholder="BH (VD: 12T)" style="width: 80px;">
            </div>
        `;

    div.querySelector(".ci-remove").addEventListener("click", () => {
      cart.splice(index, 1);
      renderCart();
    });
    div.querySelector(".btn-minus").addEventListener("click", () => {
      if (item.qty > 1) {
        item.qty--;
        renderCart();
      } else {
        cart.splice(index, 1);
        renderCart();
      }
    });
    div.querySelector(".btn-plus").addEventListener("click", () => {
      if (item.qty < item.stock) {
        item.qty++;
        renderCart();
      } else {
        showCustomAlert("Vượt quá số lượng tồn kho!");
      }
    });

    div.querySelector(".ci-qty").addEventListener("change", (e) => {
      let val = parseInt(e.target.value) || 1;
      if (val > item.stock) {
        val = item.stock;
        showCustomAlert("Vượt quá số lượng tồn kho!");
      }
      if (val < 1) val = 1;
      item.qty = val;
      renderCart();
    });

    div.querySelector(".ci-input-price").addEventListener("change", (e) => {
      let rawValue = e.target.value.replace(/[^0-9]/g, "");
      let newPrice = parseInt(rawValue) || 0;
      item.price = newPrice;
      renderCart();
    });

    const snInput = div.querySelector(".ci-input-serial");
    const snList = div.querySelector(".sn-suggest-list");

    snInput.addEventListener("input", (e) => {
      item.serial_note = e.target.value;
      const text = e.target.value;

      const parts = text.split(",");
      const currentSearch = parts[parts.length - 1].trim().toLowerCase();

      if (
        !currentSearch ||
        !item.available_serials ||
        item.available_serials === "undefined"
      ) {
        snList.style.display = "none";
        return;
      }

      const serialsInStock = item.available_serials
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter((s) => s !== "");
      const matches = serialsInStock.filter((s) =>
        s.toLowerCase().includes(currentSearch),
      );

      if (matches.length > 0) {
        snList.innerHTML = matches.map((s) => `<li>${s}</li>`).join("");
        snList.style.display = "block";
      } else {
        snList.style.display = "none";
      }
    });

    snInput.addEventListener("blur", () => {
      setTimeout(() => {
        snList.style.display = "none";
      }, 200);
    });

    snList.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        const selectedSN = e.target.textContent;
        const parts = item.serial_note.split(",");

        parts.pop();

        let newValue =
          parts.length > 0 ? parts.join(", ") + ", " + selectedSN : selectedSN;

        if (item.qty > 1 && newValue.split(",").length < item.qty) {
          newValue += ", ";
        }

        snInput.value = newValue;
        item.serial_note = newValue;
        snList.style.display = "none";
        snInput.focus();
      }
    });

    const warrantyInput = div.querySelector(".ci-input-warranty");
    if (warrantyInput) {
      warrantyInput.addEventListener("input", (e) => {
        item.warranty = e.target.value;
      });
    }

    cartBody.appendChild(div);
  });

  updateCartTotals();
}

function updateCartTotals() {
  let totalItems = 0;
  let subTotal = 0;
  let totalCost = 0;

  cart.forEach((item) => {
    totalItems += item.qty;
    subTotal += item.price * item.qty;
    totalCost += item.cost * item.qty;
  });

  const discountInput = document.getElementById("cart-discount");
  let discount = 0;
  if (discountInput) {
    discount = Number(discountInput.value) || 0;
    if (discount < 0) {
      discount = 0;
      discountInput.value = 0;
    }
  }

  const isVatChecked =
    document.getElementById("cart-vat-check")?.checked || false;
  const vatAmount = isVatChecked ? (subTotal - discount) * 0.015 : 0;

  const finalTotal = subTotal - discount + vatAmount;
  const profit = finalTotal - (isVatChecked ? vatAmount : 0) - totalCost;
  let marginPercent =
    finalTotal > 0 ? ((profit / finalTotal) * 100).toFixed(1) : 0;

  const setTxt = (id, val, isMoney = true) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isMoney ? val.toLocaleString("vi-VN") + " ₫" : val;
  };

  setTxt("cart-count", totalItems, false);
  setTxt("cart-subtotal", subTotal);
  setTxt("cart-vat-amount", vatAmount);
  setTxt("cart-final-total", finalTotal);

  setTxt("cart-total-cost", totalCost);
  setTxt("cart-profit", profit);
  const marginBadge = document.getElementById("cart-margin-percent");
  if (marginBadge) marginBadge.textContent = marginPercent + "%";
}
