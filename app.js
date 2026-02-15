// app.js - shared helpers (GitHub Pages safe)

// === SET BASE URL (Google Apps Script Web App URL) ===
const BASE_URL =
  window.APP_CONFIG?.BASE_URL ||
  "https://script.google.com/macros/s/AKfycbxTOhwbSkTgHoMvrp3EMRtKJTWm4UlddGlySl0pNbN4ytM2M0PhvAbpWd_JI0g3IR6H/exec";

const TOKEN_KEY = "kk_token";
const USER_KEY  = "kk_user";

// ===== Base path helper (fix untuk GitHub Pages subpath: /kurakura) =====
function getAppBasePath(){
  if (window.APP_CONFIG?.APP_BASE) return window.APP_CONFIG.APP_BASE.replace(/\/$/, "");
  const parts = (window.location.pathname || "").split("/").filter(Boolean);
  if (!parts.length) return "";
  return "/" + parts[0];
}
const APP_BASE = getAppBasePath();

function toUrl(path){
  path = String(path || "").trim();
  if (!path) path = "/index.html";
  if (!path.startsWith("/")) path = "/" + path;
  if (APP_BASE && path.startsWith(APP_BASE + "/")) return path;
  return (APP_BASE || "") + path;
}
function go(path){ window.location.href = toUrl(path); }

function logout(){
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  go("/index.html");
}

function requireAuthOrRedirect(){
  const t = localStorage.getItem(TOKEN_KEY);
  if(!t) go("/index.html");
}

function getToken(){ return localStorage.getItem(TOKEN_KEY) || ""; }

function getUser(){
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "{}"); }
  catch(_) { return {}; }
}

function requireAdminOrRedirect(){
  requireAuthOrRedirect();
  const u = getUser();
  if (String(u.role || "").toLowerCase() !== "admin") {
    go("/pelajar/dashboard.html");
  }
}

function requireStudentOrRedirect(){
  requireAuthOrRedirect();
  const u = getUser();
  if (String(u.role || "").toLowerCase() === "admin") {
    go("/admin/dashboard.html");
  }
}

function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

// ===== API (CORS-safe: URLSearchParams) =====
async function apiPost(payload){
  payload = payload || {};
  payload.token = payload.token || getToken();

  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k,v]) => body.append(k, v ?? ""));

  const res = await fetch(BASE_URL, { method: "POST", body });
  const text = await res.text();

  try { return JSON.parse(text); }
  catch(_) { return { ok:false, message:"Response bukan JSON", raw:text }; }
}

// --- escaping
function escapeHtml(s){
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function escapeAttr(s){ return escapeHtml(s); }
