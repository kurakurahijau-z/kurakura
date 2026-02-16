// app.js - shared helpers (GitHub Pages safe)

// === SET BASE URL (Google Apps Script Web App URL) ===
const BASE_URL =
  window.APP_CONFIG?.BASE_URL ||
  "https://script.google.com/macros/s/AKfycbzyd3baWT8RFojuWhjKCbmbSTaQoTlDzpeVsa9sf9jwkodGEXv7BXS38BqU1ltASis/exec";

// token storage keys
const TOKEN_KEY = "kk_token";
const USER_KEY  = "kk_user";

// ===== Base path helper (fix untuk GitHub Pages subpath: /kurakura) =====
function getAppBasePath(){
  // Kalau config.js ada define APP_BASE, guna itu (paling solid)
  if (window.APP_CONFIG?.APP_BASE) return window.APP_CONFIG.APP_BASE.replace(/\/$/, "");

  // Auto-detect: ambik first segment path (contoh: /kurakura/pelajar/login.html)
  const parts = (window.location.pathname || "").split("/").filter(Boolean);
  if (!parts.length) return ""; // root domain

  // GitHub Pages biasa: /<repo-name>/...
  return "/" + parts[0];
}

const APP_BASE = getAppBasePath();

function toUrl(path){
  // path boleh jadi "/index.html" atau "pelajar/login.html"
  path = String(path || "").trim();
  if (!path) path = "/index.html";
  if (!path.startsWith("/")) path = "/" + path;

  // elak double base (kalau user pass "/kurakura/index.html")
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

// ===== User helpers =====
function getToken(){ return localStorage.getItem(TOKEN_KEY) || ""; }

function getUser(){
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "{}"); }
  catch(_) { return {}; }
}

function requireAdminOrRedirect(){
  requireAuthOrRedirect();
  const u = getUser();
  if (String(u.role || "").toLowerCase() !== "admin") {
    // kalau bukan admin, campak balik ke dashboard pelajar
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

// ===== URL param helper =====
function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

// ===== API =====
async function apiPost(payload){
  payload = payload || {};
  payload.token = payload.token || getToken();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });

  let data = null;
  try{ data = await res.json(); }
  catch(_){ data = { ok:false, message:"Invalid JSON response" }; }

  return data;
}

// --- escaping
function escapeHtml(s){
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function escapeAttr(s){ return escapeHtml(s); }
