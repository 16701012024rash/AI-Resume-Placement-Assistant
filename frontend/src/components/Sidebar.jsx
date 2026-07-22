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

import {
  FaHome,
  FaFileAlt,
  FaChartLine,
  FaUserGraduate,
  FaUser,
  FaMicrophone
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2>MENU</h2>

      <ul>

        <Link
          to="/"
          style={{ textDecoration: "none", color: "white" }}
        >
          <li>
            <FaHome /> Dashboard
          </li>
        </Link>

        <Link
          to="/resume"
          style={{ textDecoration: "none", color: "white" }}
        >
          <li>
            <FaFileAlt /> Resume
          </li>
        </Link>

        <Link
          to="/analysis"
          style={{ textDecoration: "none", color: "white" }}
        >
          <li>
            <FaChartLine /> Analysis
          </li>
        </Link>

        <Link
          to="/roadmap"
          style={{ textDecoration: "none", color: "white" }}
        >
          <li>
            <FaUserGraduate /> Roadmap
          </li>
        </Link>

        <Link
          to="/interview"
          style={{ textDecoration: "none", color: "white" }}
        >
          <li>
            <FaMicrophone /> Mock Interview
          </li>
        </Link>

        <Link
          to="/profile"
          style={{ textDecoration: "none", color: "white" }}
        >
          <li>
            <FaUser /> Profile
          </li>
        </Link>

      </ul>

    </div>
  );
}

export default Sidebar;