import "../styles/ResumeAnalysis.css";

function ResumeAnalysis() {
  return (
    <div className="analysis-page">

      <h1>AI Resume Analysis</h1>

      <div className="score-section">

        <div className="score-card">
          <h2>ATS Score</h2>
          <h1>91%</h1>
        </div>

        <div className="score-card">
          <h2>Resume Score</h2>
          <h1>82%</h1>
        </div>

      </div>

      <div className="suggestion-card">

        <h2>🤖 AI Suggestions</h2>

        <ul>
          <li>✔ Add SQL in Skills section</li>
          <li>✔ Improve Project Description</li>
          <li>✔ Add Internship Experience</li>
          <li>✔ Increase Action Verbs</li>
        </ul>

      </div>

      <button className="download-btn">
        Download Improved Resume
      </button>
      <button
  className="download-btn"
  onClick={() => window.location.href="/roadmap"}
>
  View Career Roadmap
</button>

    </div>
  );
}

export default ResumeAnalysis;