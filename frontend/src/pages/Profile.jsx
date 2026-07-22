import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../lib/api";
import { getLocalUserId } from "../lib/localUser";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiCall(`/profile/${getLocalUserId()}`, { method: "GET" })
      .then(setUser)
      .catch((err) => setError(err.message || "Couldn't load your profile."));
  }, []);

  const resumeAnalysis = JSON.parse(localStorage.getItem("resumeAnalysis") || "null");

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Student")}&background=9F838C&color=fff&size=200`}
          alt="profile"
        />

        <h1>Student Profile</h1>

        {error && <p className="edit-error">{error}</p>}

        {user && (
          <>
            <p><b>Name:</b> {user.name || "Not set"}</p>
            <p><b>College:</b> {user.college || "Not set"}</p>
            <p><b>Branch:</b> {user.branch || "Not set"}</p>
            <p><b>Skills:</b> {user.skills || "Not set"}</p>
            {resumeAnalysis && (
              <p><b>Resume Score:</b> {resumeAnalysis.overall_score}%</p>
            )}
          </>
        )}

        <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
      </div>
    </div>
  );
}

export default Profile;
