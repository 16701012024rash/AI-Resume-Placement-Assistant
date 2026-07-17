import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";
function Profile() {
    const navigate = useNavigate();
  return (
    <div className="profile-page">

      <div className="profile-card">

        <img
          src="https://ui-avatars.com/api/?name=Student&background=9F838C&color=fff&size=200"
          alt="profile"
        />

        <h1>Student Profile</h1>

        <p><b>Name:</b> Your Name</p>

        <p><b>College:</b> IGDTUW</p>

        <p><b>Branch:</b> CSE-AI</p>

        <p><b>Resume Score:</b> 82%</p>

        <p><b>ATS Score:</b> 91%</p>

        <button onClick={() => navigate("/edit-profile")}>
  Edit Profile
</button>

      </div>

    </div>
  );
}

export default Profile;