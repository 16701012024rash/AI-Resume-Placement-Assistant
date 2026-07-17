import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import "../styles/Dashboard.css";

function Dashboard({ setPage }) {
  return (
    <>
      <Navbar />

      <div className="main">
        <Sidebar setPage={setPage} />

        <div className="content">
          <h1>Welcome Back 👋</h1>
          <p>Let's prepare for your dream placement.</p>

          <div className="cards">
            <DashboardCard
    title="Resume Score"
    value="82%"
    status="Excellent"
    growth="+5 this week"
  />

  <DashboardCard
    title="ATS Score"
    value="91%"
    status="Very Good"
    growth="+2%"
  />

  <DashboardCard
    title="Placement Readiness"
    value="76%"
    status="Keep Going"
    growth="Ready"
  />

  <DashboardCard
    title="Mock Interviews"
    value="12"
    status="Completed"
    growth="This Month"
  />
          </div>
          <div className="bottom-section">

  <div className="upload-box">
    <h2>📄 Upload Resume</h2>
    <p>Upload your resume to receive AI analysis and ATS score.</p>
    <button onClick={() => window.location.href="/resume"}>
  Upload Resume
</button>
  </div>

  <div className="ai-box">
    <h2>🤖 AI Suggestions</h2>
    <ul>
      <li>Add SQL in Skills section</li>
      <li>Improve project descriptions</li>
      <li>Add Internship Experience</li>
    </ul>
  </div>

</div>
<div className="progress-box">

  <h2>📈 Weekly Progress</h2>

  <div className="progress">
    <div className="progress-fill"></div>
  </div>

  <p>75% Placement Preparation Completed</p>

</div>
<div className="extra-section">

  <div className="goal-box">
    <h2>🎯 Today's Goal</h2>

    <div className="goal-item">
      <input type="checkbox" />
      <span>Solve 2 DSA Questions</span>
    </div>

    <div className="goal-item">
      <input type="checkbox" />
      <span>Improve Resume</span>
    </div>

    <div className="goal-item">
      <input type="checkbox" />
      <span>Complete Mock Interview</span>
    </div>

  </div>

  <div className="activity-box">

    <h2>📌 Recent Activity</h2>

    <p>✅ Resume Uploaded</p>
    <p>✅ ATS Score Generated</p>
    <p>🟡 Mock Interview Pending</p>
    <p>📈 Weekly Progress Updated</p>

  </div>

</div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;