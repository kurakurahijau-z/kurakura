// app.js (CORS-safe + consistent storage keys)
(function () {
  const BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.BASE_URL) || "";

  // ✅ Consistent keys (ikut yang kau guna dalam pelajar/login & pelajar/dashboard)
  const KEY_TOKEN = "kk_token";
  const KEY_USER  = "kk_user";

  function getToken() {
    return localStorage.getItem(KEY_TOKEN) || "";
  }
  function setToken(t) {
    localStorage.setItem(KEY_TOKEN, t || "");
  }
  function clearToken() {
    localStorage.removeItem(KEY_TOKEN);
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function setUser(u) {
    localStorage.setItem(KEY_USER, JSON.stringify(u || {}));
  }
  function clearUser() {
    localStorage.removeItem(KEY_USER);
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
        "Server tak bagi JSON. Ini biasanya sebab DEPLOY bukan 'Anyone' atau response HTML.\n\n" +
        parsed.raw.slice(0, 220)
      );
    }

    return parsed.data;
  }

  async function apiPost(action, body = {}) {
    if (!BASE_URL) throw new Error("BASE_URL kosong. Semak config.js");

    const token = getToken();
    const payload = { action, token, ...body };

    // ✅ PENTING: JANGAN SET headers Content-Type (elak CORS preflight)
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const parsed = await safeParseResponse(res);

    if (!parsed.ok) {
      throw new Error(
        "Server tak bagi JSON. Ini biasanya sebab DEPLOY bukan 'Anyone' atau response HTML.\n\n" +
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
    clearUser,
    KEY_TOKEN,
    KEY_USER
  };
})();
