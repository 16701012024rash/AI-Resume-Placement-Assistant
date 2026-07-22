import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResumeAnalysis.css";

function ResumeAnalysis() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeAnalysis");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) {
    return (
      <div className="analysis-page">
        <h1>AI Resume Analysis</h1>
        <div className="suggestion-card" style={{ textAlign: "center" }}>
          <p>No analysis yet — upload a resume first.</p>
          <button className="download-btn" onClick={() => navigate("/resume")}>
            Go to Resume Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <h1>AI Resume Analysis</h1>

      <div className="score-section">
        <div className="score-card">
          <h2>Overall Score</h2>
          <h1>{data.overall_score}%</h1>
        </div>
        {data.target_role && (
          <div className="score-card">
            <h2>Target Role</h2>
            <h1 style={{ fontSize: "22px" }}>{data.target_role}</h1>
          </div>
        )}
      </div>

      <div className="suggestion-card">
        <h2>✅ Strengths</h2>
        <ul>
          {data.strengths.map((s, i) => (
            <li key={i}>✔ {s}</li>
          ))}
        </ul>
      </div>

      <div className="suggestion-card">
        <h2>⚠️ Weaknesses</h2>
        <ul>
          {data.weaknesses.map((s, i) => (
            <li key={i}>✖ {s}</li>
          ))}
        </ul>
      </div>

      <div className="suggestion-card">
        <h2>🤖 AI Suggestions</h2>
        <ul>
          {data.improvement_suggestions.map((s, i) => (
            <li key={i}>✔ {s}</li>
          ))}
        </ul>
      </div>

      {(data.skills_found?.length > 0 || data.projects_found?.length > 0) && (
        <div className="suggestion-card">
          <h2>📋 Detected in your resume</h2>
          {data.skills_found?.length > 0 && (
            <p><b>Skills:</b> {data.skills_found.join(", ")}</p>
          )}
          {data.projects_found?.length > 0 && (
            <p><b>Projects:</b> {data.projects_found.join(", ")}</p>
          )}
        </div>
      )}

      <button className="download-btn" onClick={() => navigate("/roadmap")}>
        View Career Roadmap
      </button>
    </div>
  );
}

export default ResumeAnalysis;
