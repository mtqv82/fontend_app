import { importExcelApi } from "../api.js";
import { showCustomAlert } from "../alert.js";
import { loadAndRenderTable } from "../product.js";
import { initPosPage } from "../pos.js";
export async function loadExcelModal() {
  try {
    const response = await fetch("./components/excel.html");
    const html = await response.text();
    document.getElementById("modal-excel-container").innerHTML = html;
    initExcelImport();
  } catch (error) {
    console.error("Lỗi khi tải Modal Excel:", error);
  }
}

function initExcelImport() {
  const btnOpenImport = document.getElementById("btn-import-excel");
  const modalImport = document.getElementById("modal-import-excel");
  const btnCloseImport = document.getElementById("btn-close-import");
  const btnCancelImport = document.getElementById("btn-cancel-import");
  const btnConfirm = document.getElementById("btn-confirm-import");
  const btnDownloadTemplate = document.getElementById("btn-download-template");

  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("input-excel-file");
  const uploadText = document.getElementById("upload-text");

  let selectedFile = null;

  if (!btnOpenImport || !modalImport) return;

  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener("click", () => {
      const templateData = [
        [
          "Mã SKU",
          "Tên sản phẩm",
          "S/N (Cách nhau dấu phẩy)",
          "Loại linh kiện",
          "Hãng",
          "Tình trạng",
          "Tồn kho",
          "Giá vốn",
          "Giá thợ",
          "Giá lẻ",
          "Bảo hành",
          "Ghi chú",
        ],
        [
          "CPU-001",
          "Intel Core i5 12400F",
          "SN123, SN124",
          "CPU",
          "Intel",
          "Mới 100%",
          2,
          2500000,
          2650000,
          2800000,
          "36 Tháng",
          "Hàng Box",
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      ws["!cols"] = [
        { wch: 15 },
        { wch: 35 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Linh_Kien");
      XLSX.writeFile(wb, "File_Mau_Nhap_Linh_Kien.xlsx");
    });
  }

  btnOpenImport.addEventListener("click", () => {
    selectedFile = null;
    if (fileInput) fileInput.value = "";
    if (uploadText) uploadText.innerHTML = "Nhấp vào đây để chọn file Excel";
    if (uploadZone) uploadZone.style.borderColor = "#cbd5e1";
    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.style.opacity = "0.5";
      btnConfirm.style.cursor = "not-allowed";
    }
    modalImport.classList.add("active");
  });

  const closeModal = () => modalImport.classList.remove("active");
  if (btnCloseImport) btnCloseImport.addEventListener("click", closeModal);
  if (btnCancelImport) btnCancelImport.addEventListener("click", closeModal);
  if (uploadZone) uploadZone.addEventListener("click", () => fileInput.click());

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      selectedFile = e.target.files[0];
      if (selectedFile) {
        if (uploadText)
          uploadText.innerHTML = `<span style="color: #10b981; font-weight: bold;"><i class="fa-solid fa-file-circle-check"></i> Đã chọn: ${selectedFile.name}</span>`;
        if (uploadZone) uploadZone.style.borderColor = "#10b981";
        if (btnConfirm) {
          btnConfirm.disabled = false;
          btnConfirm.style.opacity = "1";
          btnConfirm.style.cursor = "pointer";
        }
      }
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener("click", () => {
      if (!selectedFile) return;
      const reader = new FileReader();
      reader.onload = async function (event) {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const rows = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]],
            { header: 1 },
          );
          const productsToImport = [];

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || !row[1]) continue;
            const snList = (row[2] ? row[2].toString() : "")
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter((s) => s !== "");
            productsToImport.push({
              sku: row[0] ? row[0].toString() : `SP-EX-${Date.now()}-${i}`,
              name: row[1].toString(),
              serial_numbers: snList,
              category: row[3] || "Khác",
              brand: row[4] || "",
              condition: row[5] || "Mới 100%",
              stock: parseInt(row[6]) || 0,
              costPrice: row[7] || 0,
              dealerPrice: row[8] || 0,
              retailPrice: row[9] || 0,
              warranty: row[10] || "36 Tháng",
              note: row[11] || "",
            });
          }

          if (productsToImport.length > 0) {
            closeModal();
            showCustomAlert(
              `Đang đồng bộ ${productsToImport.length} linh kiện...`,
              "warning",
            );
            const success = await importExcelApi(productsToImport);
            if (success) {
              showCustomAlert(
                `Đã nhập thành công ${productsToImport.length} linh kiện!`,
                "success",
              );
              loadAndRenderTable();
              initPosPage();
            } else showCustomAlert("Lỗi tải dữ liệu lên máy chủ!", "error");
          }
        } catch (error) {
          showCustomAlert(error, "error");
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    });
  }
}
