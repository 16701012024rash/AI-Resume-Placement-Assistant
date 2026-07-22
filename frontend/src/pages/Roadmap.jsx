import { useEffect, useState } from "react";
import { apiCall } from "../lib/api";
import "../styles/Roadmap.css";

const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "AI Engineer"];

function Roadmap() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gap, setGap] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // Prefill from a prior resume analysis, if one exists
    const stored = localStorage.getItem("resumeAnalysis");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.target_role) setTargetRole(data.target_role);
      if (data.skills_found?.length) setCurrentSkills(data.skills_found.join(", "));
    }
  }, []);

  async function generateRoadmap() {
    if (!targetRole.trim()) {
      setError("Enter or select a target role first.");
      return;
    }
    setError("");
    setLoading(true);
    setGap(null);
    setPlan(null);
    try {
      const skillsList = currentSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const gapResult = await apiCall("/api/skill-gap", {
        method: "POST",
        body: JSON.stringify({ current_skills: skillsList, target_role: targetRole }),
      });
      setGap(gapResult);

      const roadmapResult = await apiCall("/api/roadmap", {
        method: "POST",
        body: JSON.stringify({
          missing_skills: gapResult.missing_skills.length ? gapResult.missing_skills : skillsList,
          target_role: targetRole,
          weeks: Number(weeks),
          hours_per_week: Number(hoursPerWeek),
        }),
      });
      setPlan(roadmapResult);
    } catch (err) {
      setError(err.message || "Couldn't generate a roadmap. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="roadmap-page">
      <h1>🎯 Placement Roadmap</h1>

      <div className="roadmap-form">
        <div className="roadmap-form-row">
          <div>
            <label>Target role</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              <option value="">Select a role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Weeks</label>
            <input type="number" min="1" max="12" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
          </div>
          <div>
            <label>Hours/week</label>
            <input type="number" min="1" max="60" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} />
          </div>
        </div>

        <label>Current skills (comma-separated)</label>
        <input
          type="text"
          value={currentSkills}
          onChange={(e) => setCurrentSkills(e.target.value)}
          placeholder="e.g. HTML, CSS, React"
        />

        {error && <p className="roadmap-error">{error}</p>}

        <button onClick={generateRoadmap} disabled={loading}>
          {loading ? "Generating..." : "Generate roadmap"}
        </button>
      </div>

      {gap && (
        <div className="skill-gap-summary">
          <h3>Skill gap for {targetRole}</h3>
          {gap.matched_skills.length > 0 && <p><b>Already have:</b> {gap.matched_skills.join(", ")}</p>}
          {gap.missing_skills.length > 0 && <p><b>Missing:</b> {gap.missing_skills.join(", ")}</p>}
          {gap.nice_to_have_skills.length > 0 && <p><b>Nice to have:</b> {gap.nice_to_have_skills.join(", ")}</p>}
        </div>
      )}

      {plan && (
        <div className="roadmap-container">
          {plan.plan.map((week) => (
            <div className="roadmap-card" key={week.week}>
              <h2>Week {week.week}</h2>
              <p><b>Focus:</b> {week.focus_skills.join(", ")}</p>
              <ul>
                {week.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              {week.resources.length > 0 && (
                <p className="resources"><b>Resources:</b> {week.resources.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Roadmap;
