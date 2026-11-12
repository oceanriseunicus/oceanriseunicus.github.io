async function api(action, data = {}) {
  const token = localStorage.getItem("orus_token") || "";
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight
      body: JSON.stringify({ action, token, ...data })
    });
    const json = await res.json();
    const onLogin = location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
    if (json.error === "unauthorized" && !onLogin) {
      localStorage.removeItem("orus_token");
      location.replace("index.html");
    }
    return json;
  } catch (err) {
    return { ok: false, error: "Network error. Check your internet and API URL." };
  }
}
