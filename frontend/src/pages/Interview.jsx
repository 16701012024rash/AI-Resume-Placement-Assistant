import { useState } from "react";
import "../styles/Interview.css";

// Backend base URL. Override by creating frontend/.env with:
// REACT_APP_API_BASE=http://127.0.0.1:8000
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

const COMPANIES = {
  Google: {
    rounds: [["Online assessment", "coding + basic reasoning"], ["Technical interview", "DSA and problem solving"], ["Googleyness & leadership", "values and collaboration"]],
    topics: ["Arrays", "Graphs", "Dynamic programming", "System design basics"],
  },
  Microsoft: {
    rounds: [["Online assessment", "coding round"], ["Technical interview(s)", "DSA and OOP"], ["HR / behavioral", "culture fit"]],
    topics: ["Trees", "Linked lists", "OOP concepts", "System design"],
  },
  Amazon: {
    rounds: [["Online assessment", "coding round"], ["Technical interview", "DSA deep dive"], ["Leadership principles", "behavioral"]],
    topics: ["Arrays", "Trees", "Graphs", "Dynamic programming"],
  },
  TCS: {
    rounds: [["Aptitude test", "quant and reasoning"], ["Technical interview", "fundamentals"], ["HR interview", "fit and communication"]],
    topics: ["SQL basics", "OOP concepts", "Aptitude and reasoning", "Communication"],
  },
  Infosys: {
    rounds: [["Online test", "aptitude + coding"], ["Technical interview", "fundamentals"], ["HR interview", "fit and communication"]],
    topics: ["Basic DSA", "DBMS", "Java fundamentals", "Aptitude"],
  },
  Accenture: {
    rounds: [["Cognitive & coding assessment", "aptitude + coding"], ["Technical interview", "fundamentals + resume"], ["HR interview", "fit and communication"]],
    topics: ["Communication", "Basic programming", "Aptitude", "Resume-based questions"],
  },
};
const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "AI Engineer"];

async function apiCall(path, options) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new Error(
      `Can't reach the backend at ${API_BASE}. Make sure the FastAPI server is running (uvicorn backend.interview:app --reload).`
    );
  }
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail || "";
    } catch (e) {}
    throw new Error(detail || `Backend returned ${res.status}`);
  }
  return res.json();
}

function Interview() {
  const [screen, setScreen] = useState("setup"); // setup | loadingQuestions | interview | loadingReport | report
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  async function startInterview() {
    setError("");
    setScreen("loadingQuestions");
    try {
      const result = await apiCall("/start-interview", {
        method: "POST",
        body: JSON.stringify({ company, role }),
      });
      if (!Array.isArray(result.questions) || result.questions.length === 0) {
        throw new Error("Backend did not return any questions.");
      }
      setSessionId(result.session_id);
      setQuestions(result.questions);
      setAnswers(result.questions.map(() => null));
      setCurrent(0);
      setDraft("");
      setScreen("interview");
    } catch (err) {
      setError(err.message || "Couldn't start the interview. Try again.");
      setScreen("setup");
    }
  }

  async function submitAnswer() {
    const answer = draft.trim();
    if (!answer) {
      setError("Write an answer before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    const q = questions[current];
    try {
      const result = await apiCall("/submit-answer", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, question: q.question, answer }),
      });
      const updated = [...answers];
      updated[current] = {
        answer,
        score: Math.max(0, Math.min(10, Math.round(result.score))),
        feedback: result.feedback || "",
        strength: result.strength || "",
        weakness: result.weakness || "",
      };
      setAnswers(updated);
    } catch (err) {
      setError(err.message || "Couldn't get feedback for that answer.");
      const updated = [...answers];
      updated[current] = {
        answer,
        score: 5,
        feedback: "Feedback couldn't be generated for this answer, but it's saved. Move on to the next question.",
        strength: "",
        weakness: "",
      };
      setAnswers(updated);
    }
    setSubmitting(false);
  }

  function nextQuestion() {
    setCurrent(current + 1);
    setDraft("");
  }

  async function finishInterview() {
    setError("");
    setScreen("loadingReport");
    try {
      const result = await apiCall(`/interview-report/${sessionId}`, { method: "GET" });
      setReport({
        overallScore: result.overallScore,
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        recommendations: result.recommendations || [],
      });
    } catch (err) {
      const avg = answers.reduce((s, a) => s + a.score, 0) / answers.length;
      setError(err.message || "Couldn't generate the final report.");
      setReport({
        overallScore: Math.round(avg * 10),
        strengths: answers.filter((a) => a.strength).map((a) => a.strength),
        weaknesses: answers.filter((a) => a.weakness).map((a) => a.weakness),
        recommendations: COMPANIES[company] ? COMPANIES[company].topics : [],
      });
    }
    setScreen("report");
  }

  function restart() {
    setScreen("setup");
    setCompany("");
    setRole("");
    setSessionId("");
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setDraft("");
    setReport(null);
    setError("");
  }

  return (
    <div className="interview-page">
      <h1>🎤 Mock Interview</h1>
      <p>Practice real interview questions and get instant AI feedback.</p>

      {error && <div className="interview-error">{error}</div>}

      {screen === "setup" && (
        <div className="interview-card">
          <div className="interview-row">
            <div>
              <label>Company</label>
              <select value={company} onChange={(e) => setCompany(e.target.value)}>
                <option value="">Select a company</option>
                {Object.keys(COMPANIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Job role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select a role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {company && (
            <div className="prep-panel">
              <h3>{company} interview pattern</h3>
              <div className="rounds">
                {COMPANIES[company].rounds.map((r, i) => (
                  <div className="round" key={i}>
                    <span className="n">0{i + 1}</span>
                    <span><b>{r[0]}</b> &mdash; {r[1]}</span>
                  </div>
                ))}
              </div>
              <div className="tags">
                {COMPANIES[company].topics.map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <button disabled={!company || !role} onClick={startInterview}>
            Start interview
          </button>
        </div>
      )}

      {screen === "loadingQuestions" && (
        <div className="interview-card interview-loading">Generating your interview questions&hellip;</div>
      )}

      {screen === "interview" && (
        <div className="interview-card">
          <p className="progress-line">Question {current + 1} of {questions.length}</p>
          <span className={`qtype ${questions[current].type}`}>{questions[current].type}</span>
          <p className="qtext">{questions[current].question}</p>

          {!answers[current] ? (
            <>
              <label>Your answer</label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your answer as you would say it out loud."
              />
              <div className="interview-actions">
                <button onClick={submitAnswer} disabled={submitting}>
                  {submitting ? "Reviewing..." : "Submit answer"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`feedback ${answers[current].score < 6 ? "low" : ""}`}>
                <p className="feedback-score">Score &middot; {answers[current].score}/10</p>
                <p className="feedback-text">{answers[current].feedback}</p>
                <div className="chip-row">
                  {answers[current].strength && <span className="chip pos">{answers[current].strength}</span>}
                  {answers[current].weakness && <span className="chip neg">{answers[current].weakness}</span>}
                </div>
              </div>
              <div className="interview-actions">
                {current < questions.length - 1 ? (
                  <button onClick={nextQuestion}>Next question</button>
                ) : (
                  <button onClick={finishInterview}>See final report</button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {screen === "loadingReport" && (
        <div className="interview-card interview-loading">Putting together your report&hellip;</div>
      )}

      {screen === "report" && report && (
        <div className="interview-card">
          <div className={`stamp ${report.overallScore < 60 ? "low" : ""}`}>
            <span className="num">{report.overallScore}</span>
            <span className="lbl">out of 100</span>
          </div>

          <div className="report-section">
            <h3>Strengths</h3>
            <ul className="report-list strength">
              {report.strengths.length ? report.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>Keep practicing to build a track record here.</li>}
            </ul>
          </div>

          <div className="report-section">
            <h3>Weaknesses</h3>
            <ul className="report-list weak">
              {report.weaknesses.length ? report.weaknesses.map((s, i) => <li key={i}>{s}</li>) : <li>No major gaps flagged this round.</li>}
            </ul>
          </div>

          <div className="report-section">
            <h3>Recommended topics to review</h3>
            <ul className="report-list topic">
              {report.recommendations.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <button className="ghost" onClick={restart}>Start a new mock interview</button>
        </div>
      )}
    </div>
  );
}

export default Interview;
