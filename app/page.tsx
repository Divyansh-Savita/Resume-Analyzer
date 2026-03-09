"use client";

import { useState } from "react";
import AIAnalysis from "@/components/AIAnalysis";

export default function Home() {

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null); //store ai result


  const handleAnalyze = async () => {

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/resume/upload", {
      method: "POST",
      body: formData
    });

    const uploadData = await uploadRes.json();

    const resumeText = uploadData.extractedText;

    //match resume with job description
    const matchRes = await fetch("/api/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resumeText,
        jobDescription
      })
    });

    const matchData = await matchRes.json();
    // ⭐ AI analysis step
    const aiRes = await fetch("/api/ai-analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resumeText,
        jobText: jobDescription
      })
    });

    const aiData = await aiRes.json();


    // combine results
    setResult({
      match: matchData,
      ai: aiData.analysis
    });

  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Resume AI Analyzer</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <textarea
        placeholder="Paste Job Description"
        rows={6}
        cols={60}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAnalyze}>
        Analyze Resume Match
      </button>

      <br /><br />

      {result && (
        <div>
          <h2>Match Score: {result.match.score}%</h2>

          <h3>Matched Skills</h3>
          <ul>
            {result.match.matchedSkills.map((s: string) => (
              <li key={s}>✅ {s}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {result.match.missingSkills.map((s: string) => (
              <li key={s}>❌ {s}</li>
            ))}
          </ul>
          <hr />
          {/* ⭐ AI results */}
          <h2>AI Analysis</h2>

          <h3>Matched Skills</h3>
          <ul>
            {result.ai.matchedSkills.map((s: string, i: number) => (
              <li key={i}>✅ {s}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {result.ai.missingSkills.map((s: string, i: number) => (
              <li key={i}>❌ {s}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {result.ai.suggestions.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}