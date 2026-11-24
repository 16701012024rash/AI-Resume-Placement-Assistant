import { FiBell, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-search" aria-hidden="true">
        <span>Career preparation</span>
      </div>
      <div className="navbar-actions">
        <button className="icon-button" aria-label="Notifications"><FiBell /></button>
        <Link to="/profile" className="profile">
          <span className="profile-avatar">S</span>
          <span className="profile-copy">
            <strong>Student</strong>
            <small>My account</small>
          </span>
          <FiChevronDown />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;