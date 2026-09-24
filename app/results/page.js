"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function summarize(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "Unspecified";
    if (!groups.has(key)) {
      groups.set(key, { key, responses: 0, correct: 0, responseMs: 0, attempts: 0, studyIds: new Set() });
    }
    const group = groups.get(key);
    group.responses += 1;
    group.correct += row.correct ? 1 : 0;
    group.responseMs += Number(row.responseMs || 0);
    group.attempts += Number(row.attempt || 1);
    if (row.studyId) group.studyIds.add(row.studyId);
  }
  return [...groups.values()].map((group) => ({
    key: group.key,
    responses: group.responses,
    correct: group.correct,
    accuracy: group.responses ? (group.correct / group.responses) * 100 : 0,
    avgResponseMs: group.responses ? group.responseMs / group.responses : 0,
    avgAttempt: group.responses ? group.attempts / group.responses : 0,
    studyCount: group.studyIds.size,
  })).sort((a,b) => a.key.localeCompare(b.key));
}

function BarSummary({ title, rows }) {
  return (
    <section className="contentPanel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">Visual summary</div>
          <h2>{title}</h2>
        </div>
      </div>
      {!rows.length ? <p>No data available yet.</p> : (
        <div className="barList">
          {rows.map((row) => (
            <div className="barRow" key={row.key}>
              <div className="barLabel">
                <span>{row.key}</span>
                <strong>{row.accuracy.toFixed(1)}%</strong>
              </div>
              <div className="barTrack">
                <div className="barFill" style={{ width: Math.max(2, row.accuracy) + "%" }} />
              </div>
              <div className="barMeta">{row.responses} responses · {(row.avgResponseMs / 1000).toFixed(1)} s avg.</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryTable({ title, rows, showStudyCount = false }) {
  return (
    <section className="contentPanel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">Summary</div>
          <h2>{title}</h2>
        </div>
      </div>
      {!rows.length ? <p>No data available yet.</p> : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{title.replace("Performance by ", "")}</th>
                <th>Responses</th><th>Accuracy</th><th>Avg. time</th><th>Avg. attempt</th>
                {showStudyCount && <th>Study IDs</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td>{row.responses}</td>
                  <td>{row.accuracy.toFixed(1)}%</td>
                  <td>{row.avgResponseMs ? (row.avgResponseMs / 1000).toFixed(1) + " s" : "—"}</td>
                  <td>{row.avgAttempt.toFixed(2)}</td>
                  {showStudyCount && <td>{row.studyCount}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ResultsPage() {
  const [accessKey, setAccessKey] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("locked");
  const [error, setError] = useState("");
  const [testStatus, setTestStatus] = useState("");
  const [filters, setFilters] = useState({ course:"", module:"", question:"", studyId:"", concept:"", anchor:"" });

  const filteredRows = useMemo(() => rows.filter((row) =>
    (!filters.course || row.course === filters.course) &&
    (!filters.module || row.module === filters.module) &&
    (!filters.question || row.questionId === filters.question) &&
    (!filters.studyId || row.studyId === filters.studyId) &&
    (!filters.concept || row.conceptTag === filters.concept) &&
    (!filters.anchor || row.anchorId === filters.anchor)
  ), [rows, filters]);

  const optionValues = useMemo(() => ({
    course: [...new Set(rows.map(r=>r.course).filter(Boolean))].sort(),
    module: [...new Set(rows.map(r=>r.module).filter(Boolean))].sort(),
    question: [...new Set(rows.map(r=>r.questionId).filter(Boolean))].sort(),
    studyId: [...new Set(rows.map(r=>r.studyId).filter(Boolean))].sort(),
    concept: [...new Set(rows.map(r=>r.conceptTag).filter(Boolean))].sort(),
    anchor: [...new Set(rows.map(r=>r.anchorId).filter(Boolean))].sort(),
  }), [rows]);

  const computed = useMemo(() => {
    const source = filteredRows;
    const totalResponses = source.length;
    const correctResponses = source.filter((row) => row.correct).length;
    const avgResponseMs = totalResponses ? source.reduce((sum,row)=>sum+(row.responseMs||0),0)/totalResponses : 0;
    const uniqueStudyIds = new Set(source.map((row)=>row.studyId).filter(Boolean)).size;
    return { totalResponses, correctResponses, avgResponseMs, uniqueStudyIds };
  }, [filteredRows]);

  const courseSummary = useMemo(() => summarize(filteredRows, r=>r.course), [filteredRows]);
  const moduleSummary = useMemo(() => summarize(filteredRows, r=>r.module), [filteredRows]);
  const questionSummary = useMemo(() => summarize(filteredRows, r=>r.questionId), [filteredRows]);
  const studentSummary = useMemo(() => summarize(filteredRows, r=>r.studyId), [filteredRows]);
  const anchorSummary = useMemo(() => summarize(filteredRows.filter(r=>r.anchorId), r=>r.anchorId), [filteredRows]);

  async function loadResults(e) {
    e?.preventDefault();
    setStatus("loading"); setError("");
    try {
      const response = await fetch("/api/results", { headers: { "x-instructor-key": accessKey }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load results.");
      setRows(data.rows || []); setSummary(data.summary || null); setStatus("ready");
    } catch (err) {
      setStatus("locked"); setError(err.message || "Unable to load results.");
    }
  }

  async function runTest() {
    setTestStatus("Running database test…");
    try {
      const response = await fetch("/api/test", { method:"POST", headers:{ "x-instructor-key":accessKey } });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Test failed.");
      setTestStatus("Database test passed: write, read-back, and cleanup all succeeded.");
    } catch (err) {
      setTestStatus(err.message || "Database test failed.");
    }
  }

  function exportCsv() {
    const headers=["studyId","course","section","module","questionId","conceptTag","anchorId","choiceIndex","correct","attempt","responseMs","submittedAt"];
    const lines=[headers.join(","),...filteredRows.map(row=>headers.map(h=>csvEscape(row[h])).join(","))];
    const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="lesson-study-responses.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const accuracy = computed.totalResponses ? (computed.correctResponses/computed.totalResponses)*100 : 0;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <main className="shell">
      <Link href="/" className="backLink">← Back to case overview</Link>

      <section className="assessmentHero">
        <div className="eyebrow">Instructor dashboard</div>
        <h1>Longitudinal Response Data</h1>
        <p className="lead">Filter, compare, and export persistent study results across courses and modules.</p>
      </section>

      {status !== "ready" ? (
        <section className="contentPanel narrowPanel">
          <form className="accessForm" onSubmit={loadResults}>
            <label>Instructor access key
              <input type="password" value={accessKey} onChange={e=>setAccessKey(e.target.value)} placeholder="Enter access key" required />
            </label>
            <button className="primaryButton" type="submit" disabled={status==="loading"}>{status==="loading"?"Loading…":"Open dashboard"}</button>
          </form>
          {error && <p className="errorText">{error}</p>}
        </section>
      ) : (
        <>
          <section className="contentPanel">
            <div className="sectionHeader">
              <div><div className="eyebrow">Database diagnostic</div><h2>Connection check</h2></div>
              <button className="secondaryButton" type="button" onClick={runTest}>Run database test</button>
            </div>
            <p className="prototypeNote">{testStatus || "The test writes a synthetic response, reads it back, then removes it."}</p>
          </section>

          <section className="filterPanel">
            <div className="filterHeader">
              <div><div className="eyebrow">Filters</div><h2>Focus the dashboard</h2></div>
              {hasFilters && <button className="secondaryButton" type="button" onClick={()=>setFilters({course:"",module:"",question:"",studyId:"",concept:"",anchor:""})}>Clear filters</button>}
            </div>
            <div className="filterGrid">
              {[
                ["course","Course"],["module","Module"],["question","Question"],
                ["studyId","Study ID"],["concept","Concept"],["anchor","Anchor family"]
              ].map(([key,label])=>(
                <label key={key}>{label}
                  <select value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})}>
                    <option value="">All</option>
                    {optionValues[key].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section className="statsGrid">
            <div className="statCard"><span>Responses</span><strong>{computed.totalResponses}</strong></div>
            <div className="statCard"><span>Overall accuracy</span><strong>{computed.totalResponses?accuracy.toFixed(1)+"%":"—"}</strong></div>
            <div className="statCard"><span>Average response time</span><strong>{computed.avgResponseMs?(computed.avgResponseMs/1000).toFixed(1)+" s":"—"}</strong></div>
            <div className="statCard"><span>Study IDs</span><strong>{computed.uniqueStudyIds}</strong></div>
          </section>

          <BarSummary title="Accuracy by Course" rows={courseSummary} />
          <BarSummary title="Accuracy by Module" rows={moduleSummary} />
          <SummaryTable title="Longitudinal Anchor Performance" rows={anchorSummary} showStudyCount />
          <SummaryTable title="Performance by Question" rows={questionSummary} />
          <SummaryTable title="Performance by Study ID" rows={studentSummary} />

          <section className="contentPanel">
            <div className="sectionHeader">
              <div><div className="eyebrow">Recorded events</div><h2>Raw question-level data</h2></div>
              <div className="buttonRow">
                <button className="secondaryButton" type="button" onClick={loadResults}>Refresh</button>
                <button className="secondaryButton" type="button" onClick={exportCsv} disabled={!filteredRows.length}>Export filtered CSV</button>
              </div>
            </div>
            {!filteredRows.length ? <p>No responses match the current filters.</p> : (
              <div className="tableWrap"><table>
                <thead><tr><th>Study ID</th><th>Course</th><th>Section</th><th>Module</th><th>Question</th><th>Concept</th><th>Anchor</th><th>Correct</th><th>Attempt</th><th>Time</th><th>Submitted</th></tr></thead>
                <tbody>{filteredRows.map(row=><tr key={row.id}>
                  <td>{row.studyId||"—"}</td><td>{row.course||"—"}</td><td>{row.section||"—"}</td><td>{row.module}</td><td>{row.questionId}</td><td>{row.conceptTag||"—"}</td><td>{row.anchorId||"—"}</td><td>{row.correct?"Yes":"No"}</td><td>{row.attempt}</td><td>{row.responseMs!=null?(row.responseMs/1000).toFixed(1)+" s":"—"}</td><td>{row.submittedAt?new Date(row.submittedAt).toLocaleString():"—"}</td>
                </tr>)}</tbody>
              </table></div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
