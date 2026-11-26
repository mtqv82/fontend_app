document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      this.classList.add("active");
    });
  });

  const btnAdd = document.querySelector(".toolbar-right .btn-purple");
  if (btnAdd) {
    btnAdd.addEventListener("click", function () {
      alert("Mở form thêm linh kiện mới!");
    });
  }
});
