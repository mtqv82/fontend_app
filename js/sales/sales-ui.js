import { sales } from "./sales.js";

export function renderSales() {
  const q = (document.getElementById("searchSale")?.value || "").toLowerCase();
  let sumTotal = 0,
    sumRemaining = 0,
    sumProfit = 0;

  const list = sales.filter((s) =>
    (s.customer + s.product + s.phone).toLowerCase().includes(q),
  );

  const rowsHtml = list
    .map((s) => {
      sumTotal += Number(s.total) || 0;
      sumRemaining += Number(s.remaining) || 0;
      sumProfit += Number(s.profit) || 0;
      return `<tr class="hover:bg-blue-50">
      <td class="editable-cell text-[10px] text-center" ondblclick="editSaleCell(event, ${s.id}, 'date', 'text')">${s.date || ""}</td>
      <td class="editable-cell font-bold text-blue-800" ondblclick="editSaleCell(event, ${s.id}, 'customer', 'text')">${s.customer || ""}</td>
      <td class="editable-cell font-mono text-[10px]" ondblclick="editSaleCell(event, ${s.id}, 'phone', 'text')">${s.phone || ""}</td>
      <td class="editable-cell truncate max-w-[120px]" ondblclick="editSaleCell(event, ${s.id}, 'address', 'text')">${s.address || ""}</td>
      <td class="editable-cell text-slate-500" ondblclick="editSaleCell(event, ${s.id}, 'category', 'text')">${s.category || ""}</td>
      <td class="editable-cell font-bold text-slate-800 truncate max-w-[200px]" ondblclick="editSaleCell(event, ${s.id}, 'product', 'text')">${s.product || ""}</td>
      <td class="editable-cell text-center" ondblclick="editSaleCell(event, ${s.id}, 'unit', 'text')">${s.unit || ""}</td>
      <td class="editable-cell text-center font-bold" ondblclick="editSaleCell(event, ${s.id}, 'qty', 'number')">${s.qty || 0}</td>
      <td class="editable-cell text-right" ondblclick="editSaleCell(event, ${s.id}, 'price', 'number')">${money(s.price)}</td>
      <td class="editable-cell text-right font-bold text-slate-800 bg-slate-50" ondblclick="editSaleCell(event, ${s.id}, 'total', 'number')">${money(s.total)}</td>
      <td class="editable-cell text-right text-orange-600" ondblclick="editSaleCell(event, ${s.id}, 'discount', 'number')">${money(s.discount)}</td>
      <td class="editable-cell text-right font-black text-red-600 bg-red-50/30" ondblclick="editSaleCell(event, ${s.id}, 'remaining', 'number')">${money(s.remaining)}</td>
      <td class="editable-cell text-center text-[10px]" ondblclick="editSaleCell(event, ${s.id}, 'warranty', 'text')">${s.warranty || ""}</td>
      <td class="editable-cell text-[10px] truncate max-w-[100px]" ondblclick="editSaleCell(event, ${s.id}, 'note', 'text')">${s.note || ""}</td>
      <td class="editable-cell text-center font-bold text-indigo-700" ondblclick="editSaleCell(event, ${s.id}, 'debt', 'text')">${s.debt || ""}</td>
      <td class="editable-cell font-mono text-[10px] text-blue-600 font-bold truncate max-w-[150px]" title="${s.sx || ""}" ondblclick="editSaleCell(event, ${s.id}, 'sx', 'text')">${s.sx || ""}</td>
      <td class="editable-cell text-right font-bold text-emerald-600 bg-emerald-50/50" ondblclick="editSaleCell(event, ${s.id}, 'profit', 'number')">${money(s.profit)}</td>
      <td class="text-center align-middle"><button onclick="deleteSale(${s.id})" class="text-red-500 font-bold hover:underline text-[10px]">Xóa</button></td>
    </tr>`;
    })
    .join("");

  document.getElementById("salesTableBody").innerHTML =
    `<tr class="bg-[#c2e5a0] text-slate-900 font-black">
      <td colspan="9" class="text-center uppercase text-sm border-r border-[#9ebf80]">TỔNG DOANH THU</td>
      <td class="text-right text-sm">${money(sumTotal)}</td>
      <td></td>
      <td class="text-right text-sm text-red-700">${money(sumRemaining)}</td>
      <td colspan="4" class="border-r border-[#9ebf80]"></td>
      <td class="text-right text-sm text-emerald-800">${money(sumProfit)}</td>
      <td></td>
    </tr>` + rowsHtml;

  if (document.getElementById("kpiSales"))
    document.getElementById("kpiSales").innerText = money(sumTotal) + " đ";
}

export function editSaleCell(event, id, field, type = "text") {
  let td = event.currentTarget;
  if (td.querySelector("input")) return;

  let sale = sales.find((s) => s.id === id);
  td.innerHTML = `<input type="${type}" class="w-full min-w-[50px] border-2 border-blue-500 rounded px-1 text-xs font-bold text-slate-800 focus:outline-none" value="${sale[field] !== undefined ? sale[field] : ""}"
    onblur="saveSaleCell(${id}, '${field}', this.value)"
    onkeydown="if(event.key==='Enter'){ this.blur(); } else if(event.key==='Escape'){ renderSales(); }" />`;

  let input = td.querySelector("input");
  input.focus();
  if (type === "text")
    input.setSelectionRange(input.value.length, input.value.length);
  else input.select();
}

window.renderSales = renderSales;
window.editSaleCell = editSaleCell;
