// app.js
(function(){
  const cfg = window.APP_CONFIG || {};
  const BASE_URL = cfg.BASE_URL;

  function mustBaseUrl(){
    if(!BASE_URL || String(BASE_URL).includes("PASTE_WEB_APP_EXEC_URL")){
      throw new Error("BASE_URL belum set. Pergi config.js dan paste URL Apps Script /exec.");
    }
  }

  async function apiPost(params){
    mustBaseUrl();
    const body = new URLSearchParams();
    Object.entries(params || {}).forEach(([k,v])=> body.append(k, v ?? ""));
    const res = await fetch(BASE_URL, { method:"POST", body });
    const text = await res.text();
    try{ return JSON.parse(text); }
    catch(e){ return { ok:false, message:"Invalid JSON from server", raw:text }; }
  }

  function getParam(name){
    const url = new URL(location.href);
    return url.searchParams.get(name) || "";
  }

  function go(path){ location.href = path; }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
  function escapeAttr(s){ return escapeHtml(s); }

  function getToken(){ return localStorage.getItem("kk_token") || ""; }
  function setToken(t){ localStorage.setItem("kk_token", t || ""); }
  function clearToken(){ localStorage.removeItem("kk_token"); localStorage.removeItem("kk_user"); }

  function requireAuthOrRedirect(){
    const t = getToken();
    if(!t){ location.href = "/pelajar/login.html"; }
  }

  async function me(){
    const t = getToken();
    if(!t) return { ok:false, message:"No token" };
    return apiPost({ action:"me", token:t });
  }

  function logout(){
    clearToken();
    location.href = "/pelajar/login.html";
  }

  // expose globals (so HTML can call)
  window.apiPost = apiPost;
  window.getParam = getParam;
  window.go = go;
  window.escapeHtml = escapeHtml;
  window.escapeAttr = escapeAttr;

  window.getToken = getToken;
  window.setToken = setToken;
  window.clearToken = clearToken;

  window.requireAuthOrRedirect = requireAuthOrRedirect;
  window.me = me;
  window.logout = logout;
})();
