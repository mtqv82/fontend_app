import { getSettings } from "../api.js";

function getModalContainer() {
    let modal = document.getElementById("invoice-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "invoice-modal";
        modal.className = "modal-overlay";
        document.body.appendChild(modal);
    }
    return modal;
}

export async function renderInvoiceModal(data, options = {}) {
    const { orderId, customer, cart, totals, firstRow, isReprint } = data;
    const modal = getModalContainer();

    Object.assign(modal.style, {
        position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
        backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: "999999"
    });

    const dbSettings = await getSettings();
    const storeInfo = {
        logoUrl: "./assets/logo.png",
        name: dbSettings?.name || "MÁY TÍNH QUỐC VƯỢNG",
        address: dbSettings?.address || "",
        phoneSales: dbSettings?.phoneSales || "",
        phoneWarranty: dbSettings?.phoneWarranty || "",
        fanpage: dbSettings?.fanpage || "",
        facebook: dbSettings?.facebook || "",
        website: dbSettings?.website || "",
    };

    const warrantyTermsHtml = dbSettings?.warranty_terms
        ? dbSettings.warranty_terms.split('\n').map(line => `<p style="margin: 2px 0;">${line}</p>`).join('')
        : '<p style="margin: 2px 0;">- Chưa thiết lập điều khoản bảo hành.</p>';

    const invoiceDate = new Date(firstRow.created_at);
    const d = invoiceDate.getDate().toString().padStart(2, "0");
    const m = (invoiceDate.getMonth() + 1).toString().padStart(2, "0");
    const y = String(invoiceDate.getFullYear()).slice(-2);

    const tbodyHtml = cart.map((item, index) => `
        <tr>
            <td style="border: 1px solid #00529c; padding: 6px 4px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #00529c; padding: 6px;">
                ${item.name}
                ${item.serial_note ? `<br><i style="font-size: 11px;">S/N: ${item.serial_note}</i>` : ""}
            </td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: center;">${item.qty}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: right;">${item.price.toLocaleString("vi-VN")}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: right;">${(item.price * item.qty).toLocaleString("vi-VN")}</td>
            <td style="border: 1px solid #00529c; padding: 6px; text-align: center;">${item.warranty || ""}</td>
        </tr>
    `).join("");

    const invoiceHtml = `
    <div class="modal-content invoice-content" style="width: 950px; max-width: 95vw; max-height: 95vh; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
        <div style="text-align: right; padding: 12px 16px 0;">
            <button id="btn-close-invoice" style="background: transparent; border: none; font-size: 26px; cursor: pointer; color: #64748b; line-height: 1;">&times;</button>
        </div>
        
        <div id="print-area" style="padding: 10px 40px 30px; color: #00529c; font-family: 'Segoe UI', Arial, sans-serif; overflow-y: auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
                <div style="width: 180px; display: flex; justify-content: center; align-items: center;">
                    <img src="${storeInfo.logoUrl}" alt="Logo" style="width: 120px; height: 120px; object-fit: contain;">
                </div>
                <div style="flex: 1; text-align: center; line-height: 1.5;">
                    <h2 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; text-transform: uppercase;">${storeInfo.name}</h2>
                    <p style="margin: 3px 0; font-size: 13px;"><strong>Địa chỉ:</strong> ${storeInfo.address}</p>
                    <p style="margin: 3px 0; font-size: 13px;"><strong>Kinh doanh:</strong> ${storeInfo.phoneSales}</p>
                    <p style="margin: 3px 0; font-size: 13px;"><strong>Bảo hành:</strong> ${storeInfo.phoneWarranty} - <strong>Fanpage:</strong> ${storeInfo.fanpage}</p>
                    <p style="margin: 3px 0; font-size: 13px;"><strong>Facebook:</strong> ${storeInfo.facebook} - <strong>Web:</strong> ${storeInfo.website}</p>
                </div>
                <div style="width: 180px;"></div>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">PHIẾU XUẤT KHO KIÊM BẢO HÀNH</h3>
                <div style="font-size: 14px; font-style: italic;">
                    Ngày <span style="display:inline-block; width: 35px; text-align:center; border-bottom: 1px dotted #00529c">${d}</span> 
                    tháng <span style="display:inline-block; width: 35px; text-align:center; border-bottom: 1px dotted #00529c">${m}</span> 
                    năm 20<span style="display:inline-block; width: 35px; text-align:center; border-bottom: 1px dotted #00529c">${y}</span>
                    &nbsp;&nbsp;&nbsp;&nbsp; Số <span style="color: #dc2626; font-weight: bold; font-style: normal; font-size: 15px;">${orderId}</span>
                </div>
            </div>

            <div style="font-size: 15px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: flex-end;">
                    <span style="white-space: nowrap; margin-right: 10px;">Tên khách hàng:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #00529c; padding-bottom: 2px; padding-left: 10px; font-family: 'Segoe UI', cursive; color: #0f172a; font-weight: 500;">${customer.cusName}</span>
                    <span style="white-space: nowrap; margin-left: 20px; margin-right: 10px;">Điện thoại:</span>
                    <span style="width: 180px; border-bottom: 1px dotted #00529c; padding-bottom: 2px; padding-left: 10px; font-family: 'Segoe UI', cursive; color: #0f172a; font-weight: 500;">${customer.cusPhone}</span>
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <span style="white-space: nowrap; margin-right: 10px;">Địa chỉ:</span>
                    <span style="flex: 1; border-bottom: 1px dotted #00529c; padding-bottom: 2px; padding-left: 10px; font-family: 'Segoe UI', cursive; color: #0f172a; font-weight: 500;">${customer.cusAddress}</span>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #00529c; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: rgba(0, 82, 156, 0.05);">
                        <th style="border: 1px solid #00529c; padding: 10px 8px; width: 5%; text-align: center;">TT</th>
                        <th style="border: 1px solid #00529c; padding: 10px 8px; text-align: center;">Tên thiết bị - Diễn giải</th>
                        <th style="border: 1px solid #00529c; padding: 10px 8px; width: 8%; text-align: center;">SL</th>
                        <th style="border: 1px solid #00529c; padding: 10px 8px; width: 15%; text-align: center;">Đơn giá</th>
                        <th style="border: 1px solid #00529c; padding: 10px 8px; width: 17%; text-align: center;">Thành tiền</th>
                        <th style="border: 1px solid #00529c; padding: 10px 8px; width: 8%; text-align: center;">BH</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyHtml}
                </tbody>
                <tfoot>
                    ${totals.discount > 0 ? `
                    <tr>
                        <td colspan="4" style="border: 1px solid #00529c; padding: 8px 12px; text-align: right;">Giảm giá/Chiết khấu:</td>
                        <td style="border: 1px solid #00529c; padding: 8px 12px; text-align: right; font-weight: 500;">- ${totals.discount.toLocaleString("vi-VN")}</td>
                        <td style="border: 1px solid #00529c;"></td>
                    </tr>` : ""}
                    <tr style="background-color: rgba(0, 82, 156, 0.02);">
                        <td colspan="4" style="border: 1px solid #00529c; padding: 10px 15px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                        <td style="border: 1px solid #00529c; padding: 10px 12px; text-align: right; font-weight: bold; font-family: 'Segoe UI', cursive; color: #dc2626; font-size: 15px;">${totals.finalTotal.toLocaleString("vi-VN")}</td>
                        <td style="border: 1px solid #00529c;"></td>
                    </tr>
                </tfoot>
            </table>

            <div style="font-size: 13px; line-height: 1.6; margin-bottom: 25px;">
                <p style="margin: 0 0 6px 0; font-weight: bold; text-decoration: underline;">Hình thức bảo hành:</p>
                ${warrantyTermsHtml}
            </div>

            <div style="display: flex; justify-content: space-around; font-size: 15px; font-weight: bold; text-align: center; margin-bottom: 60px;">
                <div style="width: 33%;">Người lập phiếu</div>
                <div style="width: 33%;">Thủ kho</div>
                <div style="width: 33%;">Khách hàng</div>
            </div>
        </div>

        <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px; border-radius: 0 0 12px 12px;">
            <button class="btn btn-light" id="btn-cancel-invoice" style="padding: 10px 24px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: 600; cursor: pointer;">Đóng</button>
            <button class="btn btn-purple" id="btn-print-invoice" style="padding: 10px 24px; border-radius: 8px; border: none; background: #6366f1; color: white; font-weight: 600; cursor: pointer;"><i class="fa-solid fa-print"></i> In Lại Hóa Đơn</button>
        </div>
    </div>
    `;

    modal.innerHTML = invoiceHtml;
    modal.style.display = "flex";

    const closeModal = () => { modal.style.display = "none"; };
    document.getElementById("btn-close-invoice").addEventListener("click", closeModal);
    document.getElementById("btn-cancel-invoice").addEventListener("click", closeModal);

    if (options.onPrint) {
        document.getElementById("btn-print-invoice").addEventListener("click", () => {
            const printContent = document.getElementById("print-area").innerHTML;
            options.onPrint(printContent);
        });
    }
}