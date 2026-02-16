// app.js - shared helpers (GitHub Pages safe, Apps Script friendly)

// === SET BASE URL (Google Apps Script Web App URL) ===
const BASE_URL =
  window.APP_CONFIG?.BASE_URL ||
  "https://script.google.com/macros/s/AKfycbzyd3baWT8RFojuWhjKCbmbSTaQoTlDzpeVsa9sf9jwkodGEXv7BXS38BqU1ltASis/exec";

// token storage keys
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

function go(path){
  window.location.href = toUrl(path);
}

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

/**
 * ✅ Apps Script CORS-safe POST
 * - guna application/x-www-form-urlencoded (URLSearchParams)
 * - tak set Content-Type header (browser auto set)
 * - elak OPTIONS preflight
 */
async function apiPost(payload){
  payload = payload || {};
  payload.token = payload.token || getToken();

  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k,v]) => body.append(k, v ?? ""));

  const res = await fetch(BASE_URL, {
    method: "POST",
    body
  });

  const text = await res.text();
  try { return JSON.parse(text); }
  catch(e){ return { ok:false, message:"Response bukan JSON", raw:text }; }
}

/**
 * Optional GET helper (kalau kau nak test cepat)
 */
async function apiGet(params){
  params = params || {};
  params.token = params.token || getToken();

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => qs.append(k, v ?? ""));

  const url = BASE_URL + (BASE_URL.includes("?") ? "&" : "?") + qs.toString();
  const res = await fetch(url, { method:"GET" });

  const text = await res.text();
  try { return JSON.parse(text); }
  catch(e){ return { ok:false, message:"Response bukan JSON", raw:text }; }
}

// --- escaping
function escapeHtml(s){
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function escapeAttr(s){ return escapeHtml(s); }
