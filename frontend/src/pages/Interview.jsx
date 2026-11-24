import { useEffect, useRef, useState } from "react";
import { apiCall } from "../lib/api";
import "../styles/Interview.css";

const COMPANIES = {
  Google: {
    rounds: ["Problem solving", "Technical depth", "Googleyness & collaboration"],
    topics: ["Algorithms", "Data structures", "System design basics"],
  },
  Microsoft: {
    rounds: ["Coding & problem solving", "Technical discussion", "Growth mindset"],
    topics: ["Trees", "OOP", "System design"],
  },
  Amazon: {
    rounds: ["Online assessment", "Technical deep dive", "Leadership principles"],
    topics: ["Data structures", "Problem solving", "Ownership"],
  },
  TCS: {
    rounds: ["Aptitude & reasoning", "Technical fundamentals", "HR discussion"],
    topics: ["SQL", "OOP", "Programming fundamentals"],
  },
  Infosys: {
    rounds: ["Online assessment", "Technical fundamentals", "HR discussion"],
    topics: ["DSA basics", "DBMS", "Java fundamentals"],
  },
  Accenture: {
    rounds: ["Cognitive & coding", "Technical discussion", "HR discussion"],
    topics: ["Programming", "Problem solving", "Communication"],
  },
};

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "AI Engineer",
];
const FOCUSES = ["Balanced", "Technical deep dive", "Behavioral + project"];
const DIFFICULTIES = ["Entry level", "Intermediate"];

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function Interview() {
  const [screen, setScreen] = useState("setup");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [focus, setFocus] = useState("Balanced");
  const [difficulty, setDifficulty] = useState("Entry level");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const speechRef = useRef(null);
  const speechRecognitionAvailable =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechSynthesisAvailable =
    typeof window !== "undefined" && Boolean(window.speechSynthesis);

  useEffect(() => {
    if (screen !== "interview") return undefined;
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(
    () => () => {
      if (speechRef.current) {
        try {
          speechRef.current.stop();
        } catch (e) {
          // Recognition may already have stopped.
        }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },
    []
  );

  async function startInterview() {
    setError("");
    setScreen("loadingQuestions");
    try {
      const result = await apiCall("/start-interview", {
        method: "POST",
        body: JSON.stringify({ company, role, focus, difficulty }),
      });
      if (!Array.isArray(result.questions) || result.questions.length === 0) {
        throw new Error("The interview did not return any questions. Please try again.");
      }
      setSessionId(result.session_id);
      setQuestions(result.questions);
      setAnswers(result.questions.map(() => null));
      setCurrent(0);
      setDraft("");
      setElapsedSeconds(0);
      setScreen("briefing");
    } catch (err) {
      setError(err.message || "Couldn't prepare the interview. Try again.");
      setScreen("setup");
    }
  }

  function stopListening() {
    if (speechRef.current) {
      try {
        speechRef.current.stop();
      } catch (e) {
        setIsListening(false);
      }
    }
    setIsListening(false);
  }

  function toggleListening() {
    setVoiceError("");
    if (isListening) {
      stopListening();
      return;
    }

    const Recognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!Recognition) {
      setVoiceError("Voice input isn't supported in this browser. You can still type your answer.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setDraft(transcript);
      setAnswerError("");
    };
    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone access was blocked. Allow it in your browser settings or type your answer.",
        "no-speech": "No speech was detected. Try again or type your answer.",
        "audio-capture": "No microphone was found. Connect one or type your answer.",
      };
      setVoiceError(messages[event.error] || "Voice input stopped. You can try again or type your answer.");
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      speechRef.current = null;
    };

    try {
      speechRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      speechRef.current = null;
      setVoiceError("Couldn't start voice input. Check microphone permissions and try again.");
    }
  }

  function readQuestionAloud() {
    if (!speechSynthesisAvailable || !questions[current]) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questions[current].question);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function submitAnswer() {
    const answer = draft.trim();
    if (!answer) {
      setAnswerError("Write or dictate an answer before submitting.");
      return;
    }
    stopListening();
    setAnswerError("");
    setSubmitting(true);
    const question = questions[current];
    try {
      const result = await apiCall("/submit-answer", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          question: question.question,
          answer,
        }),
      });
      if (!result.accepted) {
        setAnswerError(result.feedback || "That answer does not address the question. Please try again.");
        return;
      }
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
      setAnswerError(err.message || "Couldn't evaluate that answer. Your answer wasn't submitted; please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    stopListening();
    setCurrent((questionIndex) => questionIndex + 1);
    setDraft("");
    setAnswerError("");
    setVoiceError("");
  }

  async function finishInterview() {
    setError("");
    setScreen("loadingReport");
    try {
      const result = await apiCall(`/interview-report/${sessionId}`, { method: "GET" });
      const categoryScores = Array.from(new Set(questions.map((question) => question.type)))
        .map((type) => {
          const categoryAnswers = answers.filter(
            (answer, index) => answer && questions[index].type === type
          );
          if (!categoryAnswers.length) return null;
          const average = categoryAnswers.reduce((total, answer) => total + answer.score, 0)
            / categoryAnswers.length;
          return { type, score: Math.round(average * 10), count: categoryAnswers.length };
        })
        .filter(Boolean);

      setReport({
        overallScore: result.overallScore,
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        recommendations: result.recommendations || [],
        categoryScores,
        questionDetails: questions.map((question, index) => ({
          ...question,
          ...answers[index],
        })),
        elapsedSeconds,
      });
      setScreen("report");
    } catch (err) {
      setError(err.message || "Couldn't generate the final report. Your answers are still saved; try again.");
      setScreen("interview");
    }
  }

  function beginInterview() {
    setScreen("interview");
  }

  function restart() {
    stopListening();
    setScreen("setup");
    setCompany("");
    setRole("");
    setFocus("Balanced");
    setDifficulty("Entry level");
    setSessionId("");
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setDraft("");
    setReport(null);
    setElapsedSeconds(0);
    setError("");
  }

  const completedCount = answers.filter(Boolean).length;
  const currentQuestion = questions[current];

  return (
    <div className="interview-page">
      <header className="interview-hero">
        <div>
          <span className="interview-eyebrow">CAREER PRACTICE STUDIO</span>
          <h1>Mock interview</h1>
          <p>Practice with role-specific questions, speak your answers, and get useful feedback.</p>
        </div>
        <span className="hero-status"><span /> AI practice session</span>
      </header>

      {error && <div className="interview-error" role="alert">{error}</div>}

      {screen === "setup" && (
        <div className="setup-layout">
          <section className="interview-card setup-card">
            <div className="section-heading">
              <span className="section-kicker">01 / SET UP</span>
              <h2>Make this interview yours</h2>
              <p>Choose your target role and the kind of practice you need today.</p>
            </div>

            <div className="setup-fields">
              <div className="field">
                <label htmlFor="company">Target company</label>
                <select id="company" value={company} onChange={(event) => setCompany(event.target.value)}>
                  <option value="">Choose a company</option>
                  {Object.keys(COMPANIES).map((name) => <option key={name}>{name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="role">Job role</label>
                <select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="">Choose a role</option>
                  {ROLES.map((name) => <option key={name}>{name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="focus">Interview focus</label>
                <select id="focus" value={focus} onChange={(event) => setFocus(event.target.value)}>
                  {FOCUSES.map((name) => <option key={name}>{name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="difficulty">Experience level</label>
                <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                  {DIFFICULTIES.map((name) => <option key={name}>{name}</option>)}
                </select>
              </div>
            </div>

            <div className="voice-note">
              <span className="voice-note-icon" aria-hidden="true">◉</span>
              <p><strong>Practice out loud.</strong> You can dictate answers and have questions read aloud. Browser voice support varies.</p>
            </div>

            <button className="primary-button setup-start" disabled={!company || !role} onClick={startInterview}>
              Build my interview <span aria-hidden="true">→</span>
            </button>
          </section>

          <aside className="interview-card prep-card">
            <span className="section-kicker">YOUR SESSION</span>
            <h2>{role || "Your target role"}</h2>
            <p className="prep-company">{company ? `Interview practice for ${company}` : "Choose a company to personalize the session."}</p>
            <div className="session-facts">
              <div><span className="fact-icon">Q</span><span><strong>6 questions</strong><small>One at a time</small></span></div>
              <div><span className="fact-icon">AI</span><span><strong>{focus}</strong><small>Question mix</small></span></div>
              <div><span className="fact-icon">↗</span><span><strong>{difficulty}</strong><small>Difficulty</small></span></div>
            </div>
            <div className="prep-divider" />
            <h3>Interview stages</h3>
            <ol className="stage-list">
              {(COMPANIES[company] || { rounds: ["Technical questions", "Problem solving", "Your projects"] }).rounds.map((round, index) => (
                <li key={round}><span>{String(index + 1).padStart(2, "0")}</span>{round}</li>
              ))}
            </ol>
            <p className="prep-footnote">Each response is reviewed before you move on. Rejected or incomplete answers can be retried.</p>
          </aside>
        </div>
      )}

      {screen === "loadingQuestions" && (
        <div className="interview-card loading-card" aria-live="polite">
          <span className="loading-orbit" aria-hidden="true" />
          <h2>Preparing your interview room</h2>
          <p>Building {difficulty.toLowerCase()} questions for a {role} role. The first request may take a little longer.</p>
        </div>
      )}

      {screen === "briefing" && (
        <section className="interview-card briefing-card">
          <span className="section-kicker">02 / BEFORE WE BEGIN</span>
          <h2>Welcome to your {role} interview</h2>
          <p className="briefing-intro">Take a breath. This is a practice session, so focus on explaining your thinking clearly rather than giving a perfect answer.</p>
          <div className="briefing-summary">
            <div><small>COMPANY</small><strong>{company}</strong></div>
            <div><small>FOCUS</small><strong>{focus}</strong></div>
            <div><small>LEVEL</small><strong>{difficulty}</strong></div>
            <div><small>QUESTIONS</small><strong>{questions.length} rounds</strong></div>
          </div>
          <div className="round-preview">
            <h3>What we’ll cover</h3>
            <div className="round-preview-list">
              {Array.from(new Set(questions.map((question) => question.type))).map((type, index) => (
                <span key={type}><b>{String(index + 1).padStart(2, "0")}</b>{type}</span>
              ))}
            </div>
          </div>
          <p className="privacy-note">Voice dictation is converted to text by your browser and may use its speech service. Audio is not saved by this app; you can type instead.</p>
          <button className="primary-button" onClick={beginInterview}>I’m ready <span aria-hidden="true">→</span></button>
        </section>
      )}

      {screen === "interview" && currentQuestion && (
        <div className="interview-room">
          <section className="interview-card question-card">
            <div className="question-topline">
              <span className="section-kicker">03 / INTERVIEW</span>
              <span className="timer-pill"><span aria-hidden="true">◷</span> {formatDuration(elapsedSeconds)}</span>
            </div>
            <div className="progress-header">
              <span>Question <strong>{current + 1}</strong> <span className="muted">of {questions.length}</span></span>
              <span>{completedCount} answered</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={completedCount} aria-valuemin="0" aria-valuemax={questions.length}>
              <span style={{ width: `${(completedCount / questions.length) * 100}%` }} />
            </div>

            <div className="question-label-row">
              <span className={`qtype type-${currentQuestion.type.toLowerCase()}`}>{currentQuestion.type}</span>
              <button
                className="text-button read-button"
                onClick={readQuestionAloud}
                disabled={!speechSynthesisAvailable}
                title={speechSynthesisAvailable ? "Read question aloud" : "Speech output is not supported in this browser"}
              >
                <span aria-hidden="true">◖))</span> Read question
              </button>
            </div>
            <h2 className="question-text">{currentQuestion.question}</h2>
            <p className="answer-guidance">Talk through your approach. A clear explanation is more valuable than a rushed answer.</p>

            {!answers[current] ? (
              <>
                <label className="answer-label" htmlFor="candidate-answer">Your answer</label>
                <textarea
                  id="candidate-answer"
                  className="answer-input"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (answerError) setAnswerError("");
                  }}
                  placeholder="Explain your thinking as if you were speaking to the interviewer…"
                  aria-describedby={answerError ? "answer-error" : undefined}
                />
                <div className="answer-toolbar">
                  <span>{draft.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <button
                    className={`voice-button${isListening ? " is-listening" : ""}`}
                    onClick={toggleListening}
                    aria-pressed={isListening}
                  >
                    <span aria-hidden="true">{isListening ? "■" : "●"}</span>
                    {isListening ? "Stop dictation" : "Answer by voice"}
                  </button>
                </div>
                {isListening && <p className="listening-status" role="status">Listening… speak clearly, then stop dictation to review your transcript.</p>}
                {voiceError && <p className="voice-error" role="status">{voiceError}</p>}
                {!speechRecognitionAvailable && <p className="voice-hint">Voice dictation isn’t available in this browser; type your answer instead.</p>}
                {answerError && <p className="interview-answer-error" id="answer-error" role="alert">{answerError}</p>}
                <div className="interview-actions">
                  <button className="primary-button" onClick={submitAnswer} disabled={submitting}>
                    {submitting ? "Reviewing your answer…" : "Submit for feedback"} <span aria-hidden="true">→</span>
                  </button>
                </div>
                {submitting && <p className="reviewing-hint" aria-live="polite">Checking relevance and preparing specific feedback. Your answer won’t be saved unless it is accepted.</p>}
              </>
            ) : (
              <div className="answer-review">
                <div className={`feedback-panel${answers[current].score < 6 ? " feedback-low" : ""}`}>
                  <div className="feedback-heading">
                    <span className="feedback-score">{answers[current].score}<small>/10</small></span>
                    <div><span className="section-kicker">INTERVIEWER FEEDBACK</span><p>{answers[current].feedback}</p></div>
                  </div>
                  <div className="feedback-points">
                    {answers[current].strength && <div className="feedback-point positive"><small>WHAT WORKED</small><strong>{answers[current].strength}</strong></div>}
                    {answers[current].weakness && <div className="feedback-point"><small>TO IMPROVE</small><strong>{answers[current].weakness}</strong></div>}
                  </div>
                </div>
                <div className="interview-actions">
                  {current < questions.length - 1 ? (
                    <button className="primary-button" onClick={nextQuestion}>Continue to next question <span aria-hidden="true">→</span></button>
                  ) : (
                    <button className="primary-button" onClick={finishInterview}>Finish & view debrief <span aria-hidden="true">→</span></button>
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="interview-card room-sidebar">
            <span className="section-kicker">SESSION GUIDE</span>
            <h3>{role}</h3>
            <p>{company} · {difficulty}</p>
            <div className="room-stat"><span>SESSION TIME</span><strong>{formatDuration(elapsedSeconds)}</strong></div>
            <div className="room-stat"><span>PROGRESS</span><strong>{completedCount} / {questions.length}</strong></div>
            <div className="room-divider" />
            <p className="room-tip-title">A useful reminder</p>
            <p className="room-tip">For technical questions, explain your assumptions, approach, and trade-offs—not just the final answer.</p>
            <p className="room-tip">Your answers are evaluated one at a time. You can retry if an answer is too short or off-topic.</p>
          </aside>
        </div>
      )}

      {screen === "loadingReport" && (
        <div className="interview-card loading-card" aria-live="polite">
          <span className="loading-orbit" aria-hidden="true" />
          <h2>Building your interview debrief</h2>
          <p>Reviewing your answers for patterns, strengths, and practical next steps.</p>
        </div>
      )}

      {screen === "report" && report && (
        <section className="interview-card report-card">
          <div className="report-header">
            <div>
              <span className="section-kicker">04 / YOUR DEBRIEF</span>
              <h2>Interview complete</h2>
              <p>{company} · {role} · {formatDuration(report.elapsedSeconds)} practice time</p>
            </div>
            <div className={`report-score${report.overallScore < 60 ? " score-low" : ""}`}>
              <strong>{report.overallScore}</strong><span> / 100</span><small>Overall score</small>
            </div>
          </div>

          <div className="report-section">
            <h3>Performance by round</h3>
            <div className="score-breakdown">
              {report.categoryScores.map((item) => (
                <div className="score-row" key={item.type}>
                  <div><strong>{item.type}</strong><span>{item.count} {item.count === 1 ? "answer" : "answers"}</span></div>
                  <div className="score-bar"><span style={{ width: `${item.score}%` }} /></div>
                  <b>{item.score}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="report-columns">
            <div className="report-section">
              <h3><span className="report-icon good">+</span> What went well</h3>
              <ul className="report-list">
                {report.strengths.length ? report.strengths.map((item, index) => <li key={index}>{item}</li>) : <li>Keep practicing to build a clear strengths profile.</li>}
              </ul>
            </div>
            <div className="report-section">
              <h3><span className="report-icon improve">↗</span> Areas to improve</h3>
              <ul className="report-list">
                {report.weaknesses.length ? report.weaknesses.map((item, index) => <li key={index}>{item}</li>) : <li>No major gaps were flagged in this session.</li>}
              </ul>
            </div>
          </div>

          <div className="report-section recommendations-section">
            <h3>Your next practice steps</h3>
            <ol className="recommendation-list">
              {report.recommendations.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
            </ol>
          </div>

          <details className="transcript-details">
            <summary>Review question-by-question feedback</summary>
            <div className="transcript-list">
              {report.questionDetails.map((item, index) => (
                <article className="transcript-item" key={`${item.type}-${index}`}>
                  <div className="transcript-topline">
                    <span>{item.type} · Question {index + 1}</span>
                    <strong>{item.score}/10</strong>
                  </div>
                  <h4>{item.question}</h4>
                  <p>{item.feedback}</p>
                  {item.answer && <blockquote>{item.answer}</blockquote>}
                </article>
              ))}
            </div>
          </details>

          <div className="report-footer">
            <p>Scores are practice feedback, not a hiring decision. Use the notes to guide your next attempt.</p>
            <button className="secondary-button" onClick={restart}>Start another interview</button>
          </div>
        </section>
      )}
    </div>
  );
}

export default Interview;
