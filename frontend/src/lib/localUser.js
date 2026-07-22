// There's no login/signup UI in the frontend yet, so this generates and
// remembers a local user_id in the browser, letting Profile/EditProfile
// persist to the real backend without needing a full auth flow first.
// Once a real login page exists, replace this with the logged-in user's
// actual user_id (e.g. from the token returned by /login).
export function getLocalUserId() {
  let id = localStorage.getItem("localUserId");
  if (!id) {
    id = "local-" + crypto.randomUUID();
    localStorage.setItem("localUserId", id);
  }
  return id;
}
