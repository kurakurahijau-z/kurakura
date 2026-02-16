// app.js
(function () {
  const BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.BASE_URL) || "";

  function getToken() {
    return localStorage.getItem("kkh_token") || "";
  }
  function setToken(t) {
    localStorage.setItem("kkh_token", t || "");
  }
  function clearToken() {
    localStorage.removeItem("kkh_token");
  }

  async function safeParseResponse(res) {
    const text = await res.text();
    // Cuba parse JSON kalau boleh
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
      // Bila deploy tak public, Apps Script akan return HTML (verify/login)
      throw new Error(
        "Server tak bagi JSON. Ini biasanya sebab DEPLOY bukan 'Anyone'.\n\nResponse (ringkas):\n" +
          parsed.raw.slice(0, 220)
      );
    }

    return parsed.data;
  }

  async function apiPost(action, body = {}) {
    if (!BASE_URL) throw new Error("BASE_URL kosong. Semak config.js");

    const token = getToken();
    const payload = { action, token, ...body };

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const parsed = await safeParseResponse(res);

    if (!parsed.ok) {
      throw new Error(
        "Server tak bagi JSON. Ini biasanya sebab DEPLOY bukan 'Anyone'.\n\nResponse (ringkas):\n" +
          parsed.raw.slice(0, 220)
      );
    }

    return parsed.data;
  }

  // expose globally
  window.KKH = {
    apiGet,
    apiPost,
    getToken,
    setToken,
    clearToken
  };
})();
