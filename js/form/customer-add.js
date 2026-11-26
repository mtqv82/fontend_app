import { addCustomerApi } from "../api.js";
import { loadAndRenderCustomers } from "../customer.js";
import { showCustomAlert } from "../alert.js";

// Hàm nhúng HTML Modal vào trang
export async function loadCustomerModal() {
  try {
    const res = await fetch("./components/modal-customer-add.html");
    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    document.body.appendChild(div); // Gắn form vào cuối thẻ body

    initCustomerModalEvents();
  } catch (error) {
    console.error("Lỗi tải modal khách hàng:", error);
  }
}

function initCustomerModalEvents() {
  const modal = document.getElementById("modal-add-customer");
  const btnClose = document.getElementById("btn-close-customer-modal");
  const btnCancel = document.getElementById("btn-cancel-customer");
  const form = document.getElementById("form-add-customer");

  // Lắng nghe sự kiện click mở Form (Vì nút Thêm nằm trong customers.html)
  document.addEventListener("click", (e) => {
    if (e.target.closest("#btn-add-customer")) {
      modal.classList.add("active");
      // Gợi ý mã KH ngẫu nhiên
      document.getElementById("add-cus-code").value =
        "KH" + Math.floor(Date.now() % 100000);
      document.getElementById("add-cus-name").focus();
    }
  });

  const closeModal = () => {
    modal.classList.remove("active");
    form.reset();
  };

  btnClose.addEventListener("click", closeModal);
  btnCancel.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById("btn-save-customer");
    btnSave.disabled = true;
    btnSave.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

    const data = {
      customer_code: document.getElementById("add-cus-code").value.trim(),
      name: document.getElementById("add-cus-name").value.trim(),
      phone: document.getElementById("add-cus-phone").value.trim(),
      type: document.getElementById("add-cus-type").value,
      address: document.getElementById("add-cus-address").value.trim(),
      note: document.getElementById("add-cus-note").value.trim(),
    };

    const res = await addCustomerApi(data);

    if (res.success) {
      showCustomAlert("Thêm khách hàng thành công!", "success");
      closeModal();
      await loadAndRenderCustomers(); // Tải lại bảng dữ liệu KH ngay lập tức
    } else {
      showCustomAlert(res.error, "error");
    }

    btnSave.disabled = false;
    btnSave.innerHTML = '<i class="fa-solid fa-save"></i> Lưu Khách Hàng';
  });
}
