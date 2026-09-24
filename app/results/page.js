"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

export default function ResultsPage() {
  const [accessKey, setAccessKey] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("locked");
  const [error, setError] = useState("");

  const computed = useMemo(() => {
    if (summary) return summary;
    const totalResponses = rows.length;
    const correctResponses = rows.filter((row) => row.correct).length;
    const avgResponseMs = totalResponses
      ? rows.reduce((sum, row) => sum + (row.responseMs || 0), 0) / totalResponses
      : 0;
    const uniqueStudyIds = new Set(rows.map((row) => row.studyId).filter(Boolean)).size;
    return { totalResponses, correctResponses, avgResponseMs, uniqueStudyIds };
  }, [rows, summary]);

  async function loadResults(e) {
    e?.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/results", {
        headers: { "x-instructor-key": accessKey },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to load results.");
      }
      setRows(data.rows || []);
      setSummary(data.summary || null);
      setStatus("ready");
    } catch (err) {
      setStatus("locked");
      setError(err.message || "Unable to load results.");
    }
  }

  function exportCsv() {
    const headers = [
      "studyId",
      "course",
      "section",
      "module",
      "questionId",
      "choiceIndex",
      "correct",
      "attempt",
      "responseMs",
      "submittedAt",
    ];

    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => csvEscape(row[header])).join(",")
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lesson-study-responses.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      <Link href="/" className="backLink">← Back to case overview</Link>

      <section className="assessmentHero">
        <div className="eyebrow">Instructor dashboard</div>
        <h1>Longitudinal Response Data</h1>
        <p className="lead">
          Shared study results from the persistent database. Access is protected
          by an instructor key configured in Vercel.
        </p>
      </section>

      {status !== "ready" ? (
        <section className="contentPanel narrowPanel">
          <form className="accessForm" onSubmit={loadResults}>
            <label>
              Instructor access key
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter access key"
                required
              />
            </label>
            <button className="primaryButton" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Loading…" : "Open dashboard"}
            </button>
          </form>
          {error && <p className="errorText">{error}</p>}
        </section>
      ) : (
        <>
          <section className="statsGrid">
            <div className="statCard">
              <span>Responses</span>
              <strong>{computed.totalResponses}</strong>
            </div>
            <div className="statCard">
              <span>Correct</span>
              <strong>{computed.correctResponses}</strong>
            </div>
            <div className="statCard">
              <span>Average response time</span>
              <strong>
                {computed.avgResponseMs
                  ? (computed.avgResponseMs / 1000).toFixed(1) + " s"
                  : "—"}
              </strong>
            </div>
            <div className="statCard">
              <span>Study IDs</span>
              <strong>{computed.uniqueStudyIds}</strong>
            </div>
          </section>

          <section className="contentPanel">
            <div className="sectionHeader">
              <div>
                <div className="eyebrow">Recorded events</div>
                <h2>Question-level data</h2>
              </div>
              <div className="buttonRow">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={loadResults}
                >
                  Refresh
                </button>
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={exportCsv}
                  disabled={!rows.length}
                >
                  Export CSV
                </button>
              </div>
            </div>

            {!rows.length ? (
              <p>No database responses have been recorded yet.</p>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Study ID</th>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Module</th>
                      <th>Question</th>
                      <th>Correct</th>
                      <th>Attempt</th>
                      <th>Time</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.studyId || "—"}</td>
                        <td>{row.course || "—"}</td>
                        <td>{row.section || "—"}</td>
                        <td>{row.module}</td>
                        <td>{row.questionId}</td>
                        <td>{row.correct ? "Yes" : "No"}</td>
                        <td>{row.attempt}</td>
                        <td>
                          {row.responseMs != null
                            ? (row.responseMs / 1000).toFixed(1) + " s"
                            : "—"}
                        </td>
                        <td>
                          {row.submittedAt
                            ? new Date(row.submittedAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
