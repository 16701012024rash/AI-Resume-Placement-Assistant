import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../lib/api";
import { getLocalUserId } from "../lib/localUser";
import "../styles/EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    branch: "",
    skills: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await apiCall(`/profile/${getLocalUserId()}`, { method: "GET" });
        setForm({
          name: user.name || "",
          email: user.email || "",
          college: user.college || "",
          branch: user.branch || "",
          skills: user.skills || "",
          phone: user.phone || "",
        });
      } catch (err) {
        setError(err.message || "Couldn't load your profile.");
      }
      setLoading(false);
    }
    load();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      await apiCall(`/profile/${getLocalUserId()}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Couldn't save your profile.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="edit-page">
        <div className="edit-card">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page">
      <div className="edit-card">
        <h1>Edit Profile</h1>

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <input
          type="text"
          placeholder="College Name"
          value={form.college}
          onChange={(e) => update("college", e.target.value)}
        />
        <input
          type="text"
          placeholder="Branch"
          value={form.branch}
          onChange={(e) => update("branch", e.target.value)}
        />
        <input
          type="text"
          placeholder="Skills"
          value={form.skills}
          onChange={(e) => update("skills", e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        {error && <p className="edit-error">{error}</p>}
        {saved && <p className="edit-saved">Saved.</p>}

        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button className="ghost" onClick={() => navigate("/profile")}>
          Back to Profile
        </button>
      </div>
    </div>
  );
}

export default EditProfile;
