// app.js - shared helpers (REPLACE FULL)

// === SET BASE URL (Google Apps Script Web App URL) ===
const BASE_URL = window.APP_CONFIG?.BASE_URL || "PASTE_WEBAPP_URL_KAU";

// token storage keys
const TOKEN_KEY = "kk_token";
const USER_KEY  = "kk_user";

// ---------- basic nav ----------
function go(path){ window.location.href = path; }

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
  try{ return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  catch(_){ return null; }
}

function setAuth(token, user){
  localStorage.setItem(TOKEN_KEY, token || "");
  localStorage.setItem(USER_KEY, JSON.stringify(user || null));
}

function requireAdminOrRedirect(){
  requireAuthOrRedirect();
  const u = getUser();
  if(!u || u.isAdmin !== true){
    go("/bukan-pelajar/index.html");
  }
}

function requireStudentOrRedirect(){
  requireAuthOrRedirect();
  const u = getUser();
  if(!u || u.isAdmin === true){
    go("/admin/dashboard.html");
  }
}

// ---------- URL helpers ----------
function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

// ---------- API ----------
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

// ---------- escaping ----------
function escapeHtml(s){
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function escapeAttr(s){ return escapeHtml(s); }

// ---------- tiny UI helpers ----------
function showStatus(el, msg, ok){
  if(!el) return;
  el.style.display = "block";
  el.className = "notice " + (ok ? "ok" : "err");
  el.textContent = msg || "";
}
