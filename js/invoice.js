import { getSettings } from "./api.js";

export async function openInvoiceModal(cart, totals, customer, options = {}) {
    const { 
        isReprint = false, 
        orderId = null, 
        onSave = null // Hàm callback chạy khi bấm nút "Lưu & Hoàn Thành"
    } = options;

    // 1. Tạo hoặc lấy Container
    let modalContainer = document.getElementById("invoice-modal-container");
    if (!modalContainer) {
        modalContainer = document.createElement("div");
        modalContainer.id = "invoice-modal-container";
        document.body.appendChild(modalContainer);
    }

    // 2. Tải giao diện HTML
    try {
        const res = await fetch('./components/invoice.html');
        if (!res.ok) throw new Error("Không tìm thấy file invoice.html");
        modalContainer.innerHTML = await res.text();
    } catch(e) {
        console.error(e);
        alert("Lỗi: Không tải được giao diện hóa đơn (invoice.html).");
        return;
    }

    const modal = document.getElementById("invoice-modal");
    if (!modal) return;

    // Ép CSS trực tiếp để đảm bảo luôn hiện
    modal.style.position = "fixed";
    Object.assign(modal.style, {
        top: "0", left: "0", width: "100vw", height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: "999999"
    });

    // 3. Tải cấu hình DB
    let store = { name: "MÁY TÍNH QUỐC VƯỢNG", address: "", phoneSales: "", phoneWarranty: "", fanpage: "", facebook: "", website: "", warrantyTerms: "" };
    try {
        const dbSettings = await getSettings();
        if (dbSettings) {
            store = { ...store, ...dbSettings, warrantyTerms: dbSettings.warranty_terms || "" };
        }
    } catch (e) {
        console.warn("Lỗi lấy cấu hình DB");
    }

    // 4. Đổ dữ liệu Header & Khách hàng
    document.getElementById("inv-store-name").textContent = store.name;
    document.getElementById("inv-store-address").textContent = store.address || "";
    document.getElementById("inv-store-sales").textContent = store.phoneSales || "";
    document.getElementById("inv-store-warranty").textContent = store.phoneWarranty || "";
    document.getElementById("inv-store-fanpage").textContent = store.fanpage || "";
    document.getElementById("inv-store-fb").textContent = store.facebook || "";
    document.getElementById("inv-store-web").textContent = store.website || "";

    const invoiceDate = new Date();
    document.getElementById("inv-date-d").textContent = invoiceDate.getDate().toString().padStart(2, "0");
    document.getElementById("inv-date-m").textContent = (invoiceDate.getMonth() + 1).toString().padStart(2, "0");
    document.getElementById("inv-date-y").textContent = String(invoiceDate.getFullYear()).slice(-2);
    document.getElementById("inv-no").textContent = orderId || String(Date.now()).slice(-7);

    document.getElementById("inv-cus-name").textContent = customer.cusName || "Khách lẻ";
    document.getElementById("inv-cus-phone").textContent = customer.cusPhone || "";
    document.getElementById("inv-cus-address").textContent = customer.cusAddress || "";

    // 5. Đổ dữ liệu Bảng
    document.getElementById("inv-table-body").innerHTML = cart.map((item, index) => `
        <tr>
            <td style="border: 1px solid #00529c; padding: 6px 4px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #00529c; padding: 6px;">${item.name} ${item.serial_note ? `<br><i style="font-size: 11px;">S/N: ${item.serial_note}</i>` : ""}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: center;">${item.qty}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: right;">${item.price.toLocaleString("vi-VN")}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: right;">${(item.price * item.qty).toLocaleString("vi-VN")}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: center;">${item.warranty || ""}</td>
        </tr>`).join("");

    let tfootHtml = "";
    if(totals.discount > 0) tfootHtml += `<tr><td colspan="4" style="border: 1px solid #00529c; padding: 8px 12px; text-align: right;">Giảm giá/Chiết khấu:</td><td style="border: 1px solid #00529c; padding: 8px 12px; text-align: right; font-weight: 500;">- ${totals.discount.toLocaleString("vi-VN")}</td><td></td></tr>`;
    tfootHtml += `<tr style="background-color: rgba(0, 82, 156, 0.02);"><td colspan="4" style="border: 1px solid #00529c; padding: 10px 15px; text-align: right; font-weight: bold;">Tổng cộng:</td><td style="border: 1px solid #00529c; padding: 10px 12px; text-align: right; font-weight: bold; font-family: 'Segoe UI', cursive; color: #dc2626; font-size: 15px;">${totals.finalTotal.toLocaleString("vi-VN")}</td><td></td></tr>`;
    document.getElementById("inv-table-foot").innerHTML = tfootHtml;

    // 6. Điều khoản bảo hành
    const termsHtml = store.warrantyTerms 
        ? store.warrantyTerms.split('\n').map(line => `<p style="margin: 2px 0;">${line}</p>`).join('') 
        : '<p>- Chưa thiết lập điều khoản.</p>';
    document.getElementById("inv-terms-box").innerHTML = `<p style="margin: 0 0 6px 0; font-weight: bold; text-decoration: underline;">Hình thức bảo hành:</p>${termsHtml}`;

    // 7. Xử lý Trạng thái In lại (Reprint)
    const btnSave = document.getElementById("btn-save-invoice");
    if (isReprint && btnSave) {
        btnSave.style.display = 'none'; // Ẩn nút lưu nếu chỉ là in lại
    }

    // 8. Đăng ký sự kiện
    const closeModal = () => { modal.style.display = "none"; };
    document.getElementById("btn-close-invoice").addEventListener("click", closeModal);
    document.getElementById("btn-cancel-invoice").addEventListener("click", closeModal);

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

    if (btnSave && !isReprint && typeof onSave === 'function') {
        btnSave.addEventListener("click", async () => {
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
            await onSave(closeModal, btnSave); // Truyền hàm đóng modal ra ngoài để gọi khi lưu xong
        });
    }
}