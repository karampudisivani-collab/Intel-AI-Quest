const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("API unavailable; using local demo mode.", err.message);
    return null;
  }
}

export const api = {
  health: () => request("/api/health"),
  generate: (payload) => request("/api/ai/generate", { method: "POST", body: JSON.stringify(payload) }),
  recommend: (payload) => request("/api/recommend", { method: "POST", body: JSON.stringify(payload) }),
  saveSession: (payload) => request("/api/sessions", { method: "POST", body: JSON.stringify(payload) }),
  analytics: () => request("/api/analytics")
};