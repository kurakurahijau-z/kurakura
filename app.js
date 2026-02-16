// app.js (Stable - form POST, no CORS preflight)
(function () {
  const BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.BASE_URL) || "";

  // ✅ guna 1 standard key je supaya semua page seragam
  const TOKEN_KEY = "kk_token";
  const USER_KEY  = "kk_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }
  function setToken(t) {
    localStorage.setItem(TOKEN_KEY, t || "");
  }
  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }
  function setUser(u){
    localStorage.setItem(USER_KEY, JSON.stringify(u || null));
  }
  function getUser(){
    try{ return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch(e){ return null; }
  }
  function clearUser(){
    localStorage.removeItem(USER_KEY);
  }

  async function safeParseResponse(res) {
    const text = await res.text();
    try {
      return { ok: true, data: JSON.parse(text), raw: text };
    } catch (e) {
      return { ok: false, data: null, raw: text };
    }
  }

  async function apiGet(action, params = {}) {
    if (!BASE_URL) throw new Error("BASE_URL kosong. Semak config.js");

    const url = new URL(BASE_URL);
    url.searchParams.set("action", action);

    const token = getToken();
    if (token) url.searchParams.set("token", token);

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });

    const res = await fetch(url.toString(), { method: "GET" });
    const parsed = await safeParseResponse(res);

    if (!parsed.ok) {
      throw new Error(
        "Server tak bagi JSON (mungkin HTML verify/login atau deploy setting salah).\n\nResponse (ringkas):\n" +
        parsed.raw.slice(0, 220)
      );
    }

    return parsed.data;
  }

  // ✅ POST guna URLSearchParams (form) - paling stabil utk Apps Script
  async function apiPost(action, body = {}) {
    if (!BASE_URL) throw new Error("BASE_URL kosong. Semak config.js");

    const token = getToken();

    const form = new URLSearchParams();
    form.append("action", action);

    // token hanya bila ada (login tak perlu token)
    if (token) form.append("token", token);

    Object.entries(body || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });

    const res = await fetch(BASE_URL, {
      method: "POST",
      body: form
    });

    const parsed = await safeParseResponse(res);

    if (!parsed.ok) {
      throw new Error(
        "Server tak bagi JSON (mungkin HTML verify/login atau deploy setting salah).\n\nResponse (ringkas):\n" +
        parsed.raw.slice(0, 220)
      );
    }

    return parsed.data;
  }

  window.KKH = {
    apiGet,
    apiPost,
    getToken,
    setToken,
    clearToken,
    getUser,
    setUser,
    clearUser
  };
})();
