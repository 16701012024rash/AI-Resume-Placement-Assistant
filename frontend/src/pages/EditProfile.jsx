import "../styles/EditProfile.css";

function EditProfile() {
  return (
    <div className="edit-page">

      <div className="edit-card">

        <h1>Edit Profile</h1>

        <input type="text" placeholder="Full Name" />

        <input type="email" placeholder="Email Address" />

        <input type="text" placeholder="College Name" />

        <input type="text" placeholder="Branch" />

        <input type="text" placeholder="Skills" />

        <input type="text" placeholder="Phone Number" />

        <button>Save Changes</button>

      </div>

    </div>
  );
}

export default EditProfile;

