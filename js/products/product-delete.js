import { deleteProductApi } from "../api.js";
import { showCustomAlert } from "../alert.js";
import { loadAndRenderTable } from "../product.js";

let deleteTargetId = null;

// Hàm phụ để đẩy ID từ file UI sang file Delete
export function openDeleteModal(id) {
  deleteTargetId = id;
  const modal = document.getElementById("modal-confirm-delete");
  if (modal) modal.classList.add("active");
}

export async function loadDeleteModal() {
  try {
    const response = await fetch("./components/modal-delete.html");
    const html = await response.text();
    document.getElementById("modal-delete-container").innerHTML = html;
    initDeleteModal();
  } catch (error) {
    console.error("Lỗi khi tải Modal Xóa:", error);
  }
}

function initDeleteModal() {
  const modal = document.getElementById("modal-confirm-delete");
  const btnCancel = document.getElementById("btn-cancel-delete");
  const btnConfirm = document.getElementById("btn-confirm-delete");

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove("active");
    deleteTargetId = null;
  };

  btnCancel.addEventListener("click", closeModal);

  btnConfirm.addEventListener("click", async () => {
    if (!deleteTargetId) return;

    btnConfirm.disabled = true;
    btnConfirm.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Đang xóa...';

    const success = await deleteProductApi(deleteTargetId);

    btnConfirm.disabled = false;
    btnConfirm.innerHTML = "Xóa sản phẩm";
    closeModal();

    if (success) {
      showCustomAlert("Đã xóa sản phẩm thành công!", "success");
      loadAndRenderTable();
    } else {
      showCustomAlert("Lỗi kết nối, không thể xóa!", "error");
    }
  });
}
