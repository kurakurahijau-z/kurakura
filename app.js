// app.js - shared helpers

// === SET BASE URL (Google Apps Script Web App URL) ===
// letak yang latest deploy kau
const BASE_URL = window.APP_CONFIG?.BASE_URL || "https://script.google.com/macros/s/AKfycbxTOhwbSkTgHoMvrp3EMRtKJTWm4UlddGlySl0pNbN4ytM2M0PhvAbpWd_JI0g3IR6H/exec";

// token storage keys
const TOKEN_KEY = "kk_token";
const USER_KEY  = "kk_user";

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

function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

async function apiPost(payload){
  payload = payload || {};
  payload.token = payload.token || getToken();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });

  let data = null;
  try{ data = await res.json(); }catch(_){ data = { ok:false, message:"Invalid JSON response" }; }
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
