import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../lib/api";
import "../styles/ResumeUpload.css";

const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "AI Engineer"];

function ResumeUpload() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    if (file.type !== "application/pdf") {
      setError("Only PDF extraction is supported here — paste your resume text below instead.");
      return;
    }

    try {
      // Lazy-load pdfjs only when a PDF is actually picked, so the rest of
      // the app doesn't pay for it on every page load.
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => it.str).join(" ") + "\n";
      }
      if (!text.trim()) {
        setError("Couldn't extract text from this PDF (it may be a scanned image). Paste the text below instead.");
      } else {
        setResumeText(text.trim());
      }
    } catch (err) {
      setError("Couldn't read this PDF automatically. Paste your resume text below instead.");
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) {
      setError("Paste your resume text, or upload a PDF, before analyzing.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await apiCall("/api/resume-review", {
        method: "POST",
        body: JSON.stringify({ resume_text: resumeText, target_role: targetRole || null }),
      });
      localStorage.setItem(
        "resumeAnalysis",
        JSON.stringify({ ...result, target_role: targetRole, analyzed_at: Date.now() })
      );
      navigate("/analysis");
    } catch (err) {
      setError(err.message || "Couldn't analyze this resume. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="resume-page">
      <h1>Upload Resume</h1>
      <p>Upload your resume for AI Analysis.</p>

      <div className="upload-card">
        <div className="upload-icon">📄</div>
        <h2>Drag & Drop Resume</h2>
        <p>PDF only (Max 5 MB)</p>

        <input type="file" accept="application/pdf" onChange={handleFile} />
        {fileName && <p className="filename">{fileName}</p>}

        <label className="target-role-label">Target role (optional)</label>
        <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
          <option value="">Not specified</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="target-role-label">Or paste your resume text</label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste the text of your resume here..."
          rows={8}
        />

        {error && <p className="upload-error">{error}</p>}

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;
