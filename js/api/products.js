import { API_URL } from "./config.js";

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Lỗi fetch sản phẩm");
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    return [];
  }
}

export async function addProductApi(productData) {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Lỗi khi thêm sản phẩm");
    return true;
  } catch (error) {
    console.error("Lỗi thêm sản phẩm:", error);
    return false;
  }
}

export async function deleteProductApi(id) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Lỗi xóa sản phẩm");
    return true;
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    return false;
  }
}

export async function updateProductFieldApi(id, field, value) {
  try {
    const res = await fetch(`${API_URL}/products/${id}/field`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
    return res.ok;
  } catch (error) {
    console.error("Lỗi cập nhật ô:", error);
    return false;
  }
}

export async function importExcelApi(productsArray) {
  try {
    const res = await fetch(`${API_URL}/products/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productsArray),
    });
    if (!res.ok) throw new Error("Lỗi nhập Excel");
    return true;
  } catch (error) {
    console.error("Lỗi API import:", error);
    return false;
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error("Lỗi fetch danh mục");
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    return [];
  }
}

export async function fetchBrands() {
  try {
    const res = await fetch(`${API_URL}/brands`);
    if (!res.ok) throw new Error("Lỗi fetch thương hiệu");
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy thương hiệu:", error);
    return [];
  }
}
