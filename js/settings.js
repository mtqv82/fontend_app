import { getSettings, updateSettings } from "./api.js";

// 1. Hàm khởi tạo trang Cài đặt (Gọi khi bấm sang tab Cài đặt)
export async function initSettingsPage() {
    renderSettingsUI();
    await loadSettingsData();
    bindSettingsEvents();
}

// 2. Hàm vẽ giao diện HTML vào div #page-settings
function renderSettingsUI() {
    const container = document.getElementById("page-settings");
    if (!container) return;

    container.innerHTML = `
        <style>
            .set-wrapper { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 20px 0; }
            .set-header { margin-bottom: 24px; }
            .set-header h2 { margin: 0; font-size: 24px; color: #0f172a; font-weight: 700; }
            .set-header p { margin: 8px 0 0 0; color: #64748b; font-size: 14px; }
            
            .set-card { background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
            .set-row { display: flex; gap: 24px; margin-bottom: 20px; }
            .set-col { flex: 1; display: flex; flex-direction: column; gap: 8px; }
            
            .set-label { font-size: 13px; font-weight: 600; color: #334155; }
            .set-input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; transition: 0.2s; background: #f8fafc; }
            .set-input:focus { border-color: #6366f1; background: #ffffff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
            
            .set-textarea { width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; transition: 0.2s; background: #f8fafc; resize: vertical; min-height: 120px; font-family: inherit; line-height: 1.5; }
            .set-textarea:focus { border-color: #6366f1; background: #ffffff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
            
            .set-footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; align-items: center; gap: 16px; }
            .set-msg { font-size: 14px; font-weight: 500; display: none; }
            .set-msg.success { color: #10b981; display: block; }
            .set-msg.error { color: #ef4444; display: block; }
            
            .set-btn-save { background: #6366f1; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-size: 14px; }
            .set-btn-save:hover { background: #4f46e5; }
        </style>

        <div class="set-wrapper">
            <div class="set-header">
                <h2><i class="fa-solid fa-store" style="color: #6366f1; margin-right: 8px;"></i> Cấu hình Cửa Hàng</h2>
                <p>Thông tin này sẽ được in trực tiếp lên hóa đơn, báo giá và phiếu bảo hành.</p>
            </div>

            <div class="set-card">
                <form id="form-settings">
                    <div class="set-row">
                        <div class="set-col">
                            <label class="set-label">Tên cửa hàng *</label>
                            <input type="text" id="set-name" class="set-input" placeholder="VD: MÁY TÍNH QUỐC VƯỢNG" required>
                        </div>
                    </div>

                    <div class="set-row">
                        <div class="set-col">
                            <label class="set-label">Địa chỉ *</label>
                            <input type="text" id="set-address" class="set-input" placeholder="Nhập địa chỉ đầy đủ..." required>
                        </div>
                    </div>

                    <div class="set-row">
                        <div class="set-col">
                            <label class="set-label">SĐT Kinh doanh</label>
                            <input type="text" id="set-phone-sales" class="set-input" placeholder="VD: 0943.17.13.19 - 0904.115.333">
                        </div>
                        <div class="set-col">
                            <label class="set-label">SĐT Bảo hành</label>
                            <input type="text" id="set-phone-warranty" class="set-input" placeholder="VD: 0904.115.222">
                        </div>
                    </div>

                    <div class="set-row">
                        <div class="set-col">
                            <label class="set-label">Tên Fanpage</label>
                            <input type="text" id="set-fanpage" class="set-input" placeholder="VD: quocvuongpcnd">
                        </div>
                        <div class="set-col">
                            <label class="set-label">Tên Facebook (Cá nhân)</label>
                            <input type="text" id="set-facebook" class="set-input" placeholder="VD: Trịnh Quốc Vượng">
                        </div>
                        <div class="set-col">
                            <label class="set-label">Website</label>
                            <input type="text" id="set-website" class="set-input" placeholder="VD: maytinhquocvuong.com">
                        </div>
                    </div>

                    <div class="set-col" style="margin-top: 10px;">
                        <label class="set-label">Điều khoản bảo hành (In mặt dưới hóa đơn)</label>
                        <textarea id="set-warranty-terms" class="set-textarea" placeholder="Nhập các điều khoản, mỗi điều khoản xuống 1 dòng..."></textarea>
                    </div>

                    <div class="set-footer">
                        <span id="set-message" class="set-msg"></span>
                        <button type="submit" class="set-btn-save">
                            <i class="fa-solid fa-floppy-disk"></i> Lưu Cấu Hình
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// 3. Hàm gọi API lấy data đắp vào form
async function loadSettingsData() {
    const data = await getSettings();
    if (data && data.name) {
        document.getElementById("set-name").value = data.name || "";
        document.getElementById("set-address").value = data.address || "";
        document.getElementById("set-phone-sales").value = data.phoneSales || "";
        document.getElementById("set-phone-warranty").value = data.phoneWarranty || "";
        document.getElementById("set-fanpage").value = data.fanpage || "";
        document.getElementById("set-facebook").value = data.facebook || "";
        document.getElementById("set-website").value = data.website || "";
        document.getElementById("set-warranty-terms").value = data.warranty_terms || "";
    }
}

// 4. Hàm bắt sự kiện Submit Form để lưu lại
function bindSettingsEvents() {
    const form = document.getElementById("form-settings");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Chặn reload trang
        
        // Thu thập dữ liệu từ các ô input
        const dataToSave = {
            name: document.getElementById("set-name").value.trim(),
            address: document.getElementById("set-address").value.trim(),
            phoneSales: document.getElementById("set-phone-sales").value.trim(),
            phoneWarranty: document.getElementById("set-phone-warranty").value.trim(),
            fanpage: document.getElementById("set-fanpage").value.trim(),
            facebook: document.getElementById("set-facebook").value.trim(),
            website: document.getElementById("set-website").value.trim(),
            warranty_terms: document.getElementById("set-warranty-terms").value.trim(),
        };

        const msgBox = document.getElementById("set-message");
        msgBox.className = "set-msg"; // reset class
        msgBox.innerHTML = "Đang lưu...";
        msgBox.style.display = "block";
        msgBox.style.color = "#64748b"; // Màu xám lúc đang lưu

        // Gọi API cập nhật
        const result = await updateSettings(dataToSave);

        if (result && result.success) {
            msgBox.className = "set-msg success";
            msgBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã lưu cấu hình thành công!';
            
            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => { msgBox.style.display = "none"; }, 3000);
        } else {
            msgBox.className = "set-msg error";
            msgBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Lỗi khi lưu. Vui lòng thử lại!';
        }
    });
}