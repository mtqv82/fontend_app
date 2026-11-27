const host = window.location.hostname;

export const API_URL = (host === "localhost" || host === "127.0.0.1") 
  ? "http://localhost:3456/api" 
  : "http://SERVER-QUOCVUONG:3456/api";
