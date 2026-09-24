"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const RESPONSE_KEY = "lessonStudyResponses";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

export default function ResultsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(RESPONSE_KEY) || "[]"
      );
      setRows(Array.isArray(stored) ? stored : []);
    } catch {
      setRows([]);
    }
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const correct = rows.filter((row) => row.correct).length;
    const avgMs =
      total > 0
        ? Math.round(rows.reduce((sum, row) => sum + (row.responseMs || 0), 0) / total)
        : 0;
    return { total, correct, avgMs };
  }, [rows]);

  function clearData() {
    if (!window.confirm("Clear all locally stored response data in this browser?")) return;
    window.localStorage.removeItem(RESPONSE_KEY);
    setRows([]);
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
        <div className="eyebrow">Local prototype data</div>
        <h1>Response Results</h1>
        <p className="lead">
          These results are stored only in this browser. This is a prototype for
          the future instructor dashboard and database.
        </p>
      </section>

      <section className="statsGrid">
        <div className="statCard"><span>Responses</span><strong>{summary.total}</strong></div>
        <div className="statCard"><span>Correct</span><strong>{summary.correct}</strong></div>
        <div className="statCard">
          <span>Average response time</span>
          <strong>{summary.avgMs ? (summary.avgMs / 1000).toFixed(1) + " s" : "—"}</strong>
        </div>
      </section>

      <section className="contentPanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">Recorded events</div>
            <h2>Question-level data</h2>
          </div>
          <div className="buttonRow">
            <button className="secondaryButton" type="button" onClick={exportCsv} disabled={!rows.length}>
              Export CSV
            </button>
            <button className="dangerButton" type="button" onClick={clearData} disabled={!rows.length}>
              Clear local data
            </button>
          </div>
        </div>

        {!rows.length ? (
          <p>No responses have been recorded in this browser yet.</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Study ID</th>
                  <th>Course</th>
                  <th>Module</th>
                  <th>Question</th>
                  <th>Correct</th>
                  <th>Attempt</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((row, index) => (
                  <tr key={row.submittedAt + "-" + index}>
                    <td>{row.studyId || "—"}</td>
                    <td>{row.course || "—"}</td>
                    <td>{row.module}</td>
                    <td>{row.questionId}</td>
                    <td>{row.correct ? "Yes" : "No"}</td>
                    <td>{row.attempt}</td>
                    <td>{((row.responseMs || 0) / 1000).toFixed(1)} s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
