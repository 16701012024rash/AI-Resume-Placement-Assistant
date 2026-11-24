// Set REACT_APP_API_BASE in frontend/.env locally and in the Render build environment.
export const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

export async function apiCall(path, options = {}) {
  if (!API_BASE) {
    throw new Error("REACT_APP_API_BASE is not configured for this frontend build.");
  }

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
