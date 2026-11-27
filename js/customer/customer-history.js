import { fetchCustomerHistory } from "./../api.js";
import { showCustomAlert } from "./../alert.js";

function getHistoryModalContainer() {
    let modal = document.getElementById("modal-cus-history-v2");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-cus-history-v2";
        
        modal.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 2147483647;";

        modal.innerHTML = `
            <div class="modal-content" style="background: #fff; width: 850px; max-width: 95vw; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: bold;"><i class="fa-solid fa-clock-rotate-left"></i> Lịch sử mua hàng</h3>
                    <button id="btn-close-cus-history-v2" style="background: transparent; border: none; font-size: 26px; cursor: pointer; color: #64748b; line-height: 1;">&times;</button>
                </div>
                <div style="max-height: 60vh; overflow-y: auto;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 15px;">
                        <thead style="position: sticky; top: 0; background: #f8fafc; z-index: 10;">
                            <tr>
                                <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; width: 120px;">Thời gian</th>
                                <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Sản phẩm</th>
                                <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #e2e8f0; width: 120px;">Tổng tiền</th>
                                <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #e2e8f0; width: 110px;">Ghi chú</th>
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

export function initCustomerHistoryEventInList() {
    const viewButtons = document.querySelectorAll(".btn-view-cus-history");
    
    viewButtons.forEach(btn => {
        btn.addEventListener("click", async function() {
            const phone = this.getAttribute("data-phone"); 
            
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
            tbodyHistory.innerHTML = '<tr><td colspan="4" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

            try {
                const data = await fetchCustomerHistory(phone);

                if (!data || data.length === 0) {
                    tbodyHistory.innerHTML = '<tr><td colspan="4" style="text-align:center;">Khách hàng này chưa có đơn nào.</td></tr>';
                    return;
                }

                tbodyHistory.innerHTML = data.map(inv => {
                    const dateObj = new Date(inv.created_at);
                    const dateStr = dateObj.toLocaleDateString("vi-VN") + "<br>" + dateObj.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
                    
                    return `
                        <tr>
                            <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${dateStr}</td>
                            
                            <!-- Thêm white-space: pre-line để nó tự xuống dòng theo dữ liệu backend -->
                            <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 14px; white-space: pre-line; line-height: 1.5; vertical-align: top;">
                                ${inv.items_list || 'Không có chi tiết'}
                            </td>
                            
                            <td style="padding: 12px 10px; text-align: right; color: #2563eb; font-weight: bold; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                ${Number(inv.final_total).toLocaleString("vi-VN")} ₫
                            </td>
                            
                            <td style="padding: 12px 10px; text-align: right; color: ${inv.debt_amount > 0 ? '#ef4444' : '#16a34a'}; font-weight: bold; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                ${inv.debt_amount > 0 ? "Nợ: " + Number(inv.debt_amount).toLocaleString("vi-VN") + " ₫" : "Đã tất toán"}
                            </td>
                        </tr>
                    `;
                }).join('');
            } catch (error) {
                console.error(error);
                tbodyHistory.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Lỗi kết nối máy chủ!</td></tr>';
            }
        });
    });
}