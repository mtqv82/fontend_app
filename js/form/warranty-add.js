export async function loadWarrantyModal() {
  try {
    const res = await fetch("./components/warranty-modal.html");

    if (!res.ok) {
      throw new Error(`Không tìm thấy warranty-modal.html! Lỗi: ${res.status}`);
    }

    const html = await res.text();
    const container = document.getElementById("modal-warranty-container");

    if (container) {
      container.innerHTML = html;
    } else {
      console.error();
    }
  } catch (error) {}
}
