import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Roadmap from "./pages/Roadmap";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Interview from "./pages/Interview";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./App.css";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-workspace">
        <Navbar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/resume" element={<AppLayout><ResumeUpload /></AppLayout>} />
        <Route path="/analysis" element={<AppLayout><ResumeAnalysis /></AppLayout>} />
        <Route path="/roadmap" element={<AppLayout><Roadmap /></AppLayout>} />
        <Route path="/interview" element={<AppLayout><Interview /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/edit-profile" element={<AppLayout><EditProfile /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;