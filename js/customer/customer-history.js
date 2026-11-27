import { fetchCustomerHistory, returnInvoiceItemsApi } from "./../api.js";
import { showCustomAlert } from "./../alert.js";

// ===============================================
// MODAL: LỊCH SỬ MUA HÀNG (ĐÃ MỞ RỘNG 1050px)
// ===============================================
function getHistoryModalContainer() {
    let modal = document.getElementById("modal-cus-history-v2");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-cus-history-v2";
        
        modal.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 2147483647;";

        modal.innerHTML = `
            <div class="modal-content" style="background: #fff; width: 1050px; max-width: 95vw; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: bold;"><i class="fa-solid fa-clock-rotate-left"></i> Lịch sử mua hàng & Đổi Trả</h3>
                    <button id="btn-close-cus-history-v2" style="background: transparent; border: none; font-size: 26px; cursor: pointer; color: #64748b; line-height: 1;">&times;</button>
                </div>
                <div style="max-height: 65vh; overflow-y: auto; overflow-x: hidden;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 15px;">
                        <thead style="position: sticky; top: 0; background: #f8fafc; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <tr>
                                <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; width: 130px;">Thời gian</th>
                                <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Sản phẩm</th>
                                <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #e2e8f0; width: 130px;">Tổng tiền</th>
                                <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #e2e8f0; width: 140px;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-cus-history-v2">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(modal); 
    }
    return modal;
}

let currentPhoneSearching = null;

// ===============================================
// KHỞI TẠO LỊCH SỬ MUA HÀNG
// ===============================================
export function initCustomerHistoryEventInList() {
    const viewButtons = document.querySelectorAll(".btn-view-cus-history");
    
    viewButtons.forEach(btn => {
        btn.addEventListener("click", async function() {
            const phone = this.getAttribute("data-phone"); 
            currentPhoneSearching = phone; 
            
            if (!phone || phone.trim() === "" || phone === "null") {
                showCustomAlert("Khách hàng này chưa có số điện thoại để tra cứu!", "error");
                return;
            }

            const modalHistory = getHistoryModalContainer();
            const tbodyHistory = document.getElementById("tbody-cus-history-v2");
            const btnCloseHistory = document.getElementById("btn-close-cus-history-v2");

            btnCloseHistory.onclick = () => modalHistory.style.display = "none";
            modalHistory.onclick = (e) => {
                if (e.target === modalHistory) modalHistory.style.display = "none";
            };

            modalHistory.style.display = "flex";
            tbodyHistory.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">Đang tải dữ liệu...</td></tr>';

            try {
                const data = await fetchCustomerHistory(phone);

                if (!data || data.length === 0) {
                    tbodyHistory.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">Khách hàng này chưa có đơn nào.</td></tr>';
                    return;
                }

                tbodyHistory.innerHTML = data.map(inv => {
                    const dateObj = new Date(inv.created_at);
                    const dateStr = dateObj.toLocaleDateString("vi-VN") + "<br>" + dateObj.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
                    
                    let statusHtml = `
                        <div style="color: ${inv.debt_amount > 0 ? '#ef4444' : '#16a34a'}; font-weight: bold; margin-bottom: 5px;">
                            ${inv.debt_amount > 0 ? "Nợ: " + Number(inv.debt_amount).toLocaleString("vi-VN") + " ₫" : "Đã tất toán"}
                        </div>
                    `;
                    
                    if (inv.note) statusHtml += `<div style="font-size: 12px; color: #888; font-style: italic;">${inv.note}</div>`;
                    
                    // Xử lý list item trả hàng Inline
                    let items = [];
                    try { items = typeof inv.raw_items === 'string' ? JSON.parse(inv.raw_items) : (inv.raw_items || []); } catch(e) {}

                    let returnHtml = '';
                    if (items.length === 0) {
                        returnHtml = '<div style="color: red; padding: 10px;">Không tìm thấy chi tiết sản phẩm.</div>';
                    } else {
                        items.forEach((item, idx) => {
                            const price = Number(item.price || item.retailPrice || 0);
                            const safeItem = JSON.stringify(item).replace(/'/g, "&#39;");
                            returnHtml += `
                                <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 10px 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-bottom: 8px;">
                                    <input type="checkbox" id="rt-chk-${inv.id}-${idx}" class="rt-item-checkbox-${inv.id}" data-index="${idx}" data-item='${safeItem}' style="transform: scale(1.3); cursor: pointer;">
                                    
                                    <div style="flex: 1; cursor: pointer;">
                                        <label for="rt-chk-${inv.id}-${idx}" style="margin: 0; font-size: 14px; color: #1e293b; font-weight: bold; cursor: pointer;">${item.name}</label>
                                        <div style="color: #64748b; font-size: 12px; margin-top: 3px;">
                                            Đơn giá: <span style="color:#e74c3c; font-weight:500;">${price.toLocaleString("vi-VN")} đ</span> | Đã mua: <strong>${item.qty}</strong>
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; flex-direction: column; align-items: center; background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">
                                        <span style="font-size: 11px; color: #475569; margin-bottom: 2px; font-weight: 500;">Trả lại (SL)</span>
                                        <input type="number" id="rt-qty-${inv.id}-${idx}" min="1" max="${item.qty}" value="${item.qty}" style="width: 50px; padding: 3px; border: 1px solid #94a3b8; border-radius: 4px; text-align: center; font-weight: bold; color: #0f172a; font-size: 13px;">
                                    </div>
                                </div>
                            `;
                        });
                    }

                    return `
                        <tr style="background: #fff; transition: background 0.2s;">
                            <td style="padding: 15px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${dateStr}</td>
                            <td style="padding: 15px 10px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 14px; white-space: pre-line; line-height: 1.5; vertical-align: top;">${inv.items_list || 'Không có chi tiết'}</td>
                            <td style="padding: 15px 10px; text-align: right; color: #2563eb; font-weight: bold; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${Number(inv.final_total).toLocaleString("vi-VN")} ₫</td>
                            <td style="padding: 15px 10px; text-align: center; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                ${statusHtml}
                                <button class="btn-toggle-return" data-id="${inv.id}" style="margin-top: 10px; padding: 6px 12px; font-size: 13px; font-weight: bold; background: #e74c3c; border: none; color: white; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 4px rgba(231,76,60,0.3); transition: 0.2s;">
                                    <i class="fa-solid fa-arrow-down"></i> Đổi / Trả
                                </button>
                            </td>
                        </tr>

                        <!-- KHUNG TRẢ HÀNG ẨN NGAY BÊN DƯỚI HÓA ĐƠN -->
                        <tr id="return-panel-${inv.id}" style="display: none; background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                            <td colspan="4" style="padding: 15px 20px;">
                                <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px dashed #94a3b8; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                                    <h4 style="margin: 0 0 12px 0; color: #e74c3c; font-size: 15px;"><i class="fa-solid fa-box-open"></i> Chọn sản phẩm muốn trả (HĐ: ${inv.id})</h4>
                                    
                                    ${returnHtml}

                                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                                        <button class="btn-cancel-inline" data-id="${inv.id}" style="padding: 7px 16px; border: 1px solid #cbd5e1; background: #f1f5f9; border-radius: 6px; cursor: pointer; font-weight: 500;">Hủy đóng</button>
                                        <button class="btn-confirm-inline" data-id="${inv.id}" style="padding: 7px 16px; border: none; background: #e74c3c; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(231,76,60,0.3);">Xác nhận Trả Hàng</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Gắn sự kiện cho các nút sau khi Render HTML
                attachInlineReturnEvents();

            } catch (error) {
                console.error(error);
                tbodyHistory.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red; padding: 20px;">Lỗi kết nối máy chủ!</td></tr>';
            }
        });
    });
}

// ===============================================
// XỬ LÝ SỰ KIỆN NÚT TRONG KHUNG TRẢ HÀNG INLINE
// ===============================================
function attachInlineReturnEvents() {
    // 1. Nút Mở/Đóng Form Trả
    document.querySelectorAll(".btn-toggle-return").forEach(btn => {
        btn.addEventListener("click", function() {
            const invId = this.getAttribute("data-id");
            const panel = document.getElementById(`return-panel-${invId}`);
            
            if(panel.style.display === "none") {
                panel.style.display = "table-row";
                this.innerHTML = '<i class="fa-solid fa-times"></i> Đóng lại';
                this.style.background = "#64748b";
            } else {
                panel.style.display = "none";
                this.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Đổi / Trả';
                this.style.background = "#e74c3c";
            }
        });
    });

    // 2. Nút Hủy bên trong form
    document.querySelectorAll(".btn-cancel-inline").forEach(btn => {
        btn.addEventListener("click", function() {
            const invId = this.getAttribute("data-id");
            document.getElementById(`return-panel-${invId}`).style.display = "none";
            const toggleBtn = document.querySelector(`.btn-toggle-return[data-id="${invId}"]`);
            if(toggleBtn) {
                toggleBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Đổi / Trả';
                toggleBtn.style.background = "#e74c3c";
            }
        });
    });

    // 3. Nút Xác Nhận Trả Hàng
    document.querySelectorAll(".btn-confirm-inline").forEach(btn => {
        btn.addEventListener("click", async function() {
            const invId = this.getAttribute("data-id");
            const checkboxes = document.querySelectorAll(`.rt-item-checkbox-${invId}:checked`);
            
            if (checkboxes.length === 0) {
                showCustomAlert("Vui lòng tích chọn ít nhất 1 sản phẩm để trả!", "warning");
                return;
            }

            let itemsToReturn = [];
            try {
                checkboxes.forEach(chk => {
                    const item = JSON.parse(chk.getAttribute("data-item"));
                    const idx = chk.getAttribute("data-index");
                    
                    const returnQty = parseInt(document.getElementById(`rt-qty-${invId}-${idx}`).value);
                    if (returnQty < 1 || returnQty > item.qty) {
                        throw new Error(`Số lượng trả của "${item.name}" không hợp lệ! (Tối đa: ${item.qty})`);
                    }

                    item.qty = returnQty; 
                    itemsToReturn.push(item);
                });
            } catch (error) {
                showCustomAlert(error.message, "error");
                return;
            }

            if (confirm(`Xác nhận trả lại ${itemsToReturn.length} mã sản phẩm này? Kho hàng và tổng tiền sẽ tự động cập nhật.`)) {
                const originalText = this.textContent;
                this.textContent = "Đang xử lý...";
                this.disabled = true;

                try {
                    const data = await returnInvoiceItemsApi(invId, itemsToReturn);
                    if (data.success) {
                        showCustomAlert(data.message, "success");
                        // Tự động Fake Click vào nút Xem Lịch Sử để refetch lại bảng
                        if(currentPhoneSearching) {
                            const viewBtn = document.querySelector(`.btn-view-cus-history[data-phone="${currentPhoneSearching}"]`);
                            if(viewBtn) viewBtn.click();
                        }
                    } else {
                        showCustomAlert("Lỗi: " + data.error, "error");
                        this.textContent = originalText;
                        this.disabled = false;
                    }
                } catch (err) {
                    showCustomAlert("Lỗi hệ thống khi trả hàng!", "error");
                    console.error(err);
                    this.textContent = originalText;
                    this.disabled = false;
                }
            }
        });
    });
}