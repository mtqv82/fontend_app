import { checkoutOrder, getSettings } from "./api.js";
import { showCustomAlert } from "./alert.js";

export function initCheckout(getCart, clearCart) {
  const btnCheckout = document.getElementById("btn-checkout");
  if (!btnCheckout) return;

  btnCheckout.addEventListener("click", async () => {
    const cart = getCart();

    if (cart.length === 0) {
      showCustomAlert(
        "Giỏ hàng đang trống! Vui lòng chọn linh kiện trước khi thanh toán.",
        "error",
      );
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
        note: document.getElementById("cart-note")?.value || "" 
    };

    const customer = { cusName, cusPhone, cusAddress };

    await openInvoiceModal(cart, totals, customer, clearCart);
  });
}

async function openInvoiceModal(cart, totals, customer, clearCart) {
  // 1. Fetch HTML giao diện hóa đơn
  let modalContainer = document.getElementById("invoice-modal-container");
  if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "invoice-modal-container";
      document.body.appendChild(modalContainer);
  }

  try {
      const res = await fetch('./components/invoice.html');
      const html = await res.text();
      modalContainer.innerHTML = html;
  } catch(e) {
      alert("Lỗi tải giao diện hóa đơn!");
      return;
  }

  const modal = document.getElementById("invoice-modal");

  // 2. Fetch Cấu hình cửa hàng
  const dbSettings = await getSettings();
  const store = {
      name: dbSettings?.name || "MÁY TÍNH QUỐC VƯỢNG",
      address: dbSettings?.address || "",
      phoneSales: dbSettings?.phoneSales || "",
      phoneWarranty: dbSettings?.phoneWarranty || "",
      fanpage: dbSettings?.fanpage || "",
      facebook: dbSettings?.facebook || "",
      website: dbSettings?.website || "",
      warrantyTerms: dbSettings?.warranty_terms || ""
  };

  // 3. Đổ dữ liệu vào DOM (Header & Customer)
  document.getElementById("inv-store-name").textContent = store.name;
  document.getElementById("inv-store-address").textContent = store.address;
  document.getElementById("inv-store-sales").textContent = store.phoneSales;
  document.getElementById("inv-store-warranty").textContent = store.phoneWarranty;
  document.getElementById("inv-store-fanpage").textContent = store.fanpage;
  document.getElementById("inv-store-fb").textContent = store.facebook;
  document.getElementById("inv-store-web").textContent = store.website;

  const now = new Date();
  document.getElementById("inv-date-d").textContent = now.getDate().toString().padStart(2, "0");
  document.getElementById("inv-date-m").textContent = (now.getMonth() + 1).toString().padStart(2, "0");
  document.getElementById("inv-date-y").textContent = String(now.getFullYear()).slice(-2);
  document.getElementById("inv-no").textContent = String(Date.now()).slice(-7);

  document.getElementById("inv-cus-name").textContent = customer.cusName;
  document.getElementById("inv-cus-phone").textContent = customer.cusPhone;
  document.getElementById("inv-cus-address").textContent = customer.cusAddress;

  // 4. Sinh HTML Bảng Sản Phẩm
  const tbodyHtml = cart.map((item, index) => `
    <tr>
        <td style="border: 1px solid #00529c; padding: 6px 4px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #00529c; padding: 6px;">${item.name} ${item.serial_note ? `<br><i style="font-size: 11px;">S/N: ${item.serial_note}</i>` : ""}</td>
        <td style="border: 1px solid #00529c; padding: 6px; text-align: center;">${item.qty}</td>
        <td style="border: 1px solid #00529c; padding: 6px; text-align: right;">${item.price.toLocaleString("vi-VN")}</td>
        <td style="border: 1px solid #00529c; padding: 6px; text-align: right;">${(item.price * item.qty).toLocaleString("vi-VN")}</td>
        <td style="border: 1px solid #00529c; padding: 6px; text-align: center;">${item.warranty || ""}</td>
    </tr>`).join("");
  document.getElementById("inv-table-body").innerHTML = tbodyHtml;

  // 5. Sinh HTML Bảng Tổng tiền
  let tfootHtml = "";
  if(totals.discount > 0) tfootHtml += `<tr><td colspan="4" style="border: 1px solid #00529c; padding: 8px 12px; text-align: right;">Giảm giá/Chiết khấu:</td><td style="border: 1px solid #00529c; padding: 8px 12px; text-align: right; font-weight: 500;">- ${totals.discount.toLocaleString("vi-VN")}</td><td></td></tr>`;
  if(totals.vatAmount > 0) tfootHtml += `<tr><td colspan="4" style="border: 1px solid #00529c; padding: 8px 12px; text-align: right;">Thuế VAT (1.5%):</td><td style="border: 1px solid #00529c; padding: 8px 12px; text-align: right; font-weight: 500;">+ ${totals.vatAmount.toLocaleString("vi-VN")}</td><td></td></tr>`;
  
  tfootHtml += `<tr style="background-color: rgba(0, 82, 156, 0.02);"><td colspan="4" style="border: 1px solid #00529c; padding: 10px 15px; text-align: right; font-weight: bold;">Tổng cộng:</td><td style="border: 1px solid #00529c; padding: 10px 12px; text-align: right; font-weight: bold; font-family: 'Segoe UI', cursive; color: #dc2626; font-size: 15px;">${totals.finalTotal.toLocaleString("vi-VN")}</td><td></td></tr>`;
  document.getElementById("inv-table-foot").innerHTML = tfootHtml;

  // 6. Xử lý HTML Điều khoản bảo hành
  const termsHtml = store.warrantyTerms 
      ? store.warrantyTerms.split('\n').map(line => `<p style="margin: 2px 0;">${line}</p>`).join('') 
      : '<p>- Chưa thiết lập điều khoản.</p>';
  document.getElementById("inv-terms-box").innerHTML = `<p style="margin: 0 0 6px 0; font-weight: bold; text-decoration: underline;">Hình thức bảo hành:</p>${termsHtml}`;

  // 7. Hiển thị Modal
  modal.classList.add("active");
  const closeModal = () => modal.classList.remove("active");
  
  document.getElementById("btn-close-invoice").addEventListener("click", closeModal);
  document.getElementById("btn-cancel-invoice").addEventListener("click", closeModal);

  // 8. Bắt sự kiện IN HÓA ĐƠN
  document.getElementById("btn-print-invoice").addEventListener("click", () => {
    const printContent = document.getElementById("print-area").innerHTML;
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
        <html><head><title>In Hóa Đơn</title>
        <style>
            @page { size: A5 portrait; margin: 8mm; }
            body { font-family: Arial, sans-serif; color: #00529c !important; line-height: 1.4; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { border: 1px solid #00529c !important; padding: 6px; }
            th { background: #e6f2ff !important; }
            img { max-width: 100%; height: auto; }
        </style></head>
        <body onload="window.print();">${printContent}</body></html>
    `);
    doc.close();
    setTimeout(() => document.body.removeChild(printFrame), 1000);
  });

  // 9. Bắt sự kiện LƯU
  document.getElementById("btn-save-invoice").addEventListener("click", async () => {
      const btnSave = document.getElementById("btn-save-invoice");
      btnSave.disabled = true;
      btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

      try {
        const orderData = {
          customer: customer,
          totals: totals,
          cart: cart.map(item => ({
            sku: item.sku, name: item.name, price: item.price,
            qty: item.qty, cost: item.cost, warranty: item.warranty || "", serial_note: item.serial_note || ""
          })),
        };

        const result = await checkoutOrder(orderData);
        if (result.success) {
          showCustomAlert(`Thanh toán & trừ kho thành công!`, "success");
          window.dispatchEvent(new Event("refreshInvoiceHistory"));
          window.dispatchEvent(new Event("refreshCustomers"));
          closeModal();
          clearCart();
          window.dispatchEvent(new Event("refreshPosProducts"));
        }
      } catch (error) {
         showCustomAlert(error.message, "error");
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fa-solid fa-check"></i> Lưu & Hoàn Thành';
      }
  });
}