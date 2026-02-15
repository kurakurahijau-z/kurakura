// app.js
// Shared helpers for kura kura hijau (GitHub Pages version)

const BASE_URL = window.APP_CONFIG?.BASE_URL || "";

const TOKEN_KEY = "kk_token";
const USER_KEY  = "kk_user";

/* ==============================
   Basic Navigation
============================== */

function go(path){
  window.location.href = path;
}

function logout(){
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  go("/pelajar/login.html");
}

function getToken(){
  return localStorage.getItem(TOKEN_KEY) || "";
}

function getUser(){
  try{
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}

/* ==============================
   Auth Guards
============================== */

function requireAuthOrRedirect(){
  const token = getToken();
  if(!token){
    go("/pelajar/login.html");
  }
}

async function requireAdminOrRedirect(){
  const token = getToken();
  if(!token){
    go("/pelajar/login.html");
    return;
  }

  const res = await apiPost({ action:"me" });

  if(!res?.ok || !res?.user){
    logout();
    return;
  }

  if(String(res.user.role).toLowerCase() !== "admin"){
    go("/pelajar/dashboard.html");
  }
}

async function requireStudentOrRedirect(){
  const token = getToken();
  if(!token){
    go("/pelajar/login.html");
    return;
  }

  const res = await apiPost({ action:"me" });

  if(!res?.ok || !res?.user){
    logout();
    return;
  }

  if(String(res.user.role).toLowerCase() !== "student"){
    go("/admin/dashboard.html");
  }
}

/* ==============================
   API Helper (JSON only)
============================== */

async function apiPost(payload){
  if(!BASE_URL){
    return { ok:false, message:"BASE_URL tidak diset dalam config.js" };
  }

  payload = payload || {};
  payload.token = payload.token || getToken();

  try{
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;

  }catch(err){
    console.error("API ERROR:", err);
    return { ok:false, message:"Server tidak dapat dihubungi." };
  }
}

/* ==============================
   Utils
============================== */

function escapeHtml(s){
  s = String(s ?? "");
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[m]));
}

function escapeAttr(s){
  return escapeHtml(s);
}
