// Shared fetch helper for talking to the FastAPI backend.
// Override the backend URL by creating frontend/.env with:
// REACT_APP_API_BASE=http://127.0.0.1:8000
export const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export async function apiCall(path, options = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new Error(
      `Can't reach the backend at ${API_BASE}. Make sure the FastAPI server is running (uvicorn backend.interview:app --reload).`
    );
  }
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail || "";
    } catch (e) {}
    throw new Error(detail || `Backend returned ${res.status}`);
  }
  return res.json();
}
