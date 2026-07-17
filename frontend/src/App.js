
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Roadmap from "./pages/Roadmap";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/analysis" element={<ResumeAnalysis />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;