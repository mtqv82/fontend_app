import { showCustomAlert } from "./../alert.js";
import { openInvoiceModal } from "./invoice-modal.js";

export function initCheckout(getCart, clearCart) {
  let btnCheckout = document.getElementById("btn-checkout");
  if (!btnCheckout) return;

  // 1. FIX LỖI NHÂN ĐÔI SỰ KIỆN: Xóa sạch event cũ trước khi gắn event mới
  const newBtn = btnCheckout.cloneNode(true);
  btnCheckout.parentNode.replaceChild(newBtn, btnCheckout);
  btnCheckout = newBtn;

  btnCheckout.addEventListener("click", async () => {
    const cart = getCart();

    if (cart.length === 0) {
      showCustomAlert(
        "Giỏ hàng đang trống! Vui lòng chọn linh kiện trước khi thanh toán.",
        "error"
      );
      return;
    }

    // 2. FIX LỖI TỒN KHO: Kiểm tra số lượng trước khi mở Modal
    const outOfStockItems = cart.filter(item => item.stock !== undefined && item.qty > item.stock);
    if (outOfStockItems.length > 0) {
        const errorMsg = outOfStockItems.map(i => 
            `- ${i.name} (Tồn: <b style="color:red">${i.stock}</b>, Đang chọn: <b>${i.qty}</b>)`
        ).join("<br>");
        
        showCustomAlert(`<div style="text-align:left;"><b>Không đủ số lượng tồn kho:</b><br>${errorMsg}</div>`, "error");
        return; 
    }

    let cusName = document.getElementById("pos-cus-name")?.value.trim() || "Khách lẻ";
    let cusPhone = document.getElementById("pos-cus-phone")?.value.trim() || "";
    let cusAddress = document.getElementById("pos-cus-address")?.value.trim() || "";

    const strToNum = (str) => parseInt(str.replace(/[^0-9]/g, "")) || 0;
    const totals = {
      subTotal: strToNum(document.getElementById("cart-subtotal")?.textContent || "0"),
      discount: Number(document.getElementById("cart-discount")?.value) || 0,
      vatAmount: strToNum(document.getElementById("cart-vat-amount")?.textContent || "0"),
      finalTotal: strToNum(document.getElementById("cart-final-total")?.textContent || "0"),
      note: document.getElementById("cart-note")?.value || "",
    };

    const customer = { cusName, cusPhone, cusAddress };

    await openInvoiceModal(cart, totals, customer, clearCart);
  });
}