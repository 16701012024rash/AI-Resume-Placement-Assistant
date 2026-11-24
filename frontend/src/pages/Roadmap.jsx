import { useEffect, useState } from "react";
import { apiCall } from "../lib/api";
import "../styles/Roadmap.css";

const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "AI Engineer"];
const ROADMAP_STORAGE_KEY = "placementRoadmapV1";

function Roadmap() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [gap, setGap] = useState(null);
  const [plan, setPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    let analysis;
    let savedRoadmap;
    try {
      analysis = localStorage.getItem("resumeAnalysis");
      savedRoadmap = localStorage.getItem(ROADMAP_STORAGE_KEY);
    } catch {
      setError("Browser storage is unavailable, so saved roadmap progress cannot be loaded.");
      return;
    }

    if (analysis) {
      try {
        const data = JSON.parse(analysis);
        if (data.target_role) setTargetRole(data.target_role);
        if (data.skills_found?.length) setCurrentSkills(data.skills_found.join(", "));
      } catch {
        setError("Saved resume details could not be read. You can still enter your skills below.");
      }
    }

    if (savedRoadmap) {
      try {
        const saved = JSON.parse(savedRoadmap);
        if (saved.targetRole) setTargetRole(saved.targetRole);
        if (saved.currentSkills) setCurrentSkills(saved.currentSkills);
        if (saved.weeks) setWeeks(saved.weeks);
        if (saved.hoursPerWeek) setHoursPerWeek(saved.hoursPerWeek);
        if (saved.gap) setGap(saved.gap);
        if (saved.plan) setPlan(saved.plan);
        if (saved.completedTasks) setCompletedTasks(saved.completedTasks);
      } catch {
        setError("Saved roadmap progress could not be read. Generate a new roadmap to continue.");
      }
    }
  }, []);

  function saveRoadmapProgress(nextCompletedTasks) {
    const savedRoadmap = localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (!savedRoadmap) {
      throw new Error("No saved roadmap was found.");
    }
    localStorage.setItem(
      ROADMAP_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(savedRoadmap),
        completedTasks: nextCompletedTasks,
      })
    );
  }

  function toggleTask(taskId) {
    const nextCompletedTasks = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId],
    };
    setCompletedTasks(nextCompletedTasks);
    try {
      saveRoadmapProgress(nextCompletedTasks);
      setError("");
    } catch {
      setError("Progress could not be saved in this browser. Check available storage and try again.");
    }
  }

  async function generateRoadmap() {
    if (!targetRole.trim()) {
      setError("Enter or select a target role first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const skillsList = currentSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      setLoadingStep("Comparing your skills with the target role...");
      const gapResult = await apiCall("/api/skill-gap", {
        method: "POST",
        body: JSON.stringify({ current_skills: skillsList, target_role: targetRole }),
      });
      setGap(gapResult);

      setLoadingStep("Building your weekly plan and matching free resources...");
      const roadmapResult = await apiCall("/api/roadmap", {
        method: "POST",
        body: JSON.stringify({
          missing_skills: gapResult.missing_skills.length ? gapResult.missing_skills : skillsList,
          current_skills: skillsList,
          priority_order: gapResult.priority_order,
          target_role: targetRole,
          weeks: Number(weeks),
          hours_per_week: Number(hoursPerWeek),
        }),
      });
      const saved = {
        targetRole,
        currentSkills,
        weeks: Number(weeks),
        hoursPerWeek: Number(hoursPerWeek),
        gap: gapResult,
        plan: roadmapResult,
        completedTasks: {},
      };
      setPlan(roadmapResult);
      setCompletedTasks({});
      setGap(gapResult);
      try {
        localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(saved));
      } catch {
        setError("Roadmap generated, but browser storage is unavailable so progress may not persist.");
      }
    } catch (err) {
      setError(err.message || "Couldn't generate a roadmap. Try again.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  const taskCount = plan
    ? plan.plan.reduce((count, week) => count + week.tasks.length, 0)
    : 0;
  const completedCount = plan
    ? plan.plan.reduce(
        (count, week) =>
          count +
          week.tasks.filter((_, index) => completedTasks[`week-${week.week}-task-${index}`]).length,
        0
      )
    : 0;
  const progressPercent = taskCount ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="roadmap-page">
      <h1>🎯 Placement Roadmap</h1>
      <p className="roadmap-intro">
        A weekly plan built around your target role, current skills, and available study time.
      </p>

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
        {loading && <p className="roadmap-loading" aria-live="polite">{loadingStep}</p>}
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
          <section className="roadmap-progress">
            <div className="progress-heading">
              <div>
                <h2>Your progress</h2>
                <p>{completedCount} of {taskCount} tasks complete</p>
              </div>
              <strong>{progressPercent}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Roadmap completion"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="progress-saved">Your plan and checked tasks are saved in this browser.</p>
          </section>

          {plan.plan.map((week) => {
            const weekCompleted = week.tasks.filter(
              (_, index) => completedTasks[`week-${week.week}-task-${index}`]
            ).length;
            return (
              <article className="roadmap-card" key={week.week}>
                <div className="week-heading">
                  <div>
                    <span className="week-label">WEEK {String(week.week).padStart(2, "0")}</span>
                    <h2>{week.objective}</h2>
                  </div>
                  <span className="week-hours">{week.hours_per_week} hrs / week</span>
                </div>
                <p className="week-focus"><b>Focus:</b> {week.focus_skills.join(", ")}</p>
                <p className="week-task-count">{weekCompleted} / {week.tasks.length} tasks complete</p>
                <div className="roadmap-task-list">
                  {week.tasks.map((task, index) => {
                    const taskId = `week-${week.week}-task-${index}`;
                    return (
                      <label className={`roadmap-task${completedTasks[taskId] ? " is-complete" : ""}`} key={taskId}>
                        <input
                          type="checkbox"
                          checked={Boolean(completedTasks[taskId])}
                          onChange={() => toggleTask(taskId)}
                        />
                        <span>{task}</span>
                      </label>
                    );
                  })}
                </div>
                {week.resources.length > 0 && (
                  <div className="week-resources">
                    <h3>Free learning resources</h3>
                    <div className="resource-list">
                      {week.resources.map((resource) => (
                        <a
                          className="resource-link"
                          href={resource.url}
                          key={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="free-label">FREE</span>
                          <strong>{resource.title}</strong>
                          <span>{resource.description}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Roadmap;
