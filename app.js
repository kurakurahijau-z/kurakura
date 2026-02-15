// app.js - shared helpers

// === SET BASE URL (Google Apps Script Web App URL) ===
const BASE_URL =
  window.APP_CONFIG?.BASE_URL ||
  "https://script.google.com/macros/s/AKfycbxTOhwbSkTgHoMvrp3EMRtKJTWm4UlddGlySl0pNbN4ytM2M0PhvAbpWd_JI0g3IR6H/exec";

// === SET APP BASE PATH (GitHub Pages project repo path) ===
// Force using config BASE_PATH if available to avoid /pelajar/... 404
function normalizeBasePath_(p) {
  p = String(p || "").trim();
  if (!p) return "";
  if (!p.startsWith("/")) p = "/" + p;
  // remove trailing slash
  p = p.replace(/\/+$/, "");
  return p;
}

const APP_BASE = (() => {
  const forced = normalizeBasePath_(window.APP_CONFIG?.BASE_PATH);
  if (forced) return forced;

  // fallback infer: /<repo>/...
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  // if running at domain root, empty; else first segment is repo
  return "/" + parts[0];
})();

function toUrl(path) {
  path = String(path || "");
  if (!path) return APP_BASE + "/";

  // absolute URL, keep
  if (/^https?:\/\//i.test(path)) return path;

  // ensure leading slash
  if (!path.startsWith("/")) path = "/" + path;

  // avoid double base when already includes it
  if (APP_BASE && path.startsWith(APP_BASE + "/")) return path;

  return (APP_BASE || "") + path;
}

// token storage keys
const TOKEN_KEY = "kk_token";
const USER_KEY = "kk_user";

function go(path) {
  window.location.href = toUrl(path);
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  go("/index.html");
}

function requireAuthOrRedirect() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t) go("/index.html");
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

async function apiPost(payload) {
  payload = payload || {};
  payload.token = payload.token || getToken();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = { ok: false, message: "Invalid JSON response" };
  }
  return data;
}

// --- escaping
function escapeHtml(s) {
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}
function escapeAttr(s) { return escapeHtml(s); }
