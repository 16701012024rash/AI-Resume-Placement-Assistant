// import {
//   FaHome,
//   FaFileAlt,
//   FaChartLine,
//   FaUserGraduate,
//   FaUser
// } from "react-icons/fa";

// function Sidebar({ setPage }) {
//   return (
//     <div className="sidebar">

//       <h2>MENU</h2>

//       <ul>

//         <li onClick={() => setPage("/")}>
//           <FaHome /> Dashboard
//         </li>

//         <li onClick={() => setPage("/resume")}>
//           <FaFileAlt /> Resume
//         </li>

//         <li onClick={() => setPage("/analysis")}>
//           <FaChartLine /> Analysis
//         </li>

//         <li onClick={() => setPage("/roadmap")}>
//           <FaUserGraduate /> Roadmap
//         </li>

//         <li onClick={() => setPage("/profile")}>
//           <FaUser /> Profile
//         </li>

//       </ul>

//     </div>
//   );
// }

// export default Sidebar;

import { FaHome, FaFileAlt, FaChartLine, FaUserGraduate, FaUser, FaMicrophone } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Overview", icon: FaHome },
  { to: "/resume", label: "Resume", icon: FaFileAlt },
  { to: "/analysis", label: "Analysis", icon: FaChartLine },
  { to: "/roadmap", label: "Roadmap", icon: FaUserGraduate },
  { to: "/interview", label: "Mock interview", icon: FaMicrophone },
  { to: "/profile", label: "Profile", icon: FaUser },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="Placement AI home">
        <span className="brand-mark">P</span>
        <span>Placement<span>AI</span></span>
      </NavLink>
      <div className="sidebar-label">Workspace</div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" />
        <div><strong>Preparation mode</strong><small>Keep going</small></div>
      </div>
    </aside>
  );
}

export default Sidebar;