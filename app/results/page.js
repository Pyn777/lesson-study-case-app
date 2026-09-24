"use client";

import Link from "next/link";
import { useMemo, useState } from "react";


const MODULE_ORDER = {
  "cellular-foundation": 1,
  microbiology: 2,
  "renal-response": 3,
  "integrated-assessment": 4,
};

const MODULE_LABEL = {
  "cellular-foundation": "Cellular Foundation",
  microbiology: "Microbiology",
  "renal-response": "Renal Response",
  "integrated-assessment": "Integrated Assessment",
};

function buildRepeatedMeasures(rows) {
  const grouped = new Map();

  for (const row of rows) {
    if (!row.studyId) continue;
    const key = row.studyId;
    if (!grouped.has(key)) grouped.set(key, new Map());

    const stageMap = grouped.get(key);
    const stageKey = row.module || "unknown";
    if (!stageMap.has(stageKey)) {
      stageMap.set(stageKey, {
        module: stageKey,
        responses: 0,
        correct: 0,
        decisionMs: 0,
        submittedAt: row.submittedAt || "",
      });
    }

    const stage = stageMap.get(stageKey);
    stage.responses += 1;
    stage.correct += row.correct ? 1 : 0;
    stage.decisionMs += Number(row.decisionMs ?? row.responseMs ?? 0);
    if (row.submittedAt && row.submittedAt > stage.submittedAt) {
      stage.submittedAt = row.submittedAt;
    }
  }

  const result = [];
  for (const [studyId, stageMap] of grouped.entries()) {
    const stages = [...stageMap.values()]
      .map((stage) => ({
        ...stage,
        order: MODULE_ORDER[stage.module] ?? 99,
        label: MODULE_LABEL[stage.module] || stage.module,
        accuracy: stage.responses ? (stage.correct / stage.responses) * 100 : 0,
        avgDecisionMs: stage.responses ? stage.decisionMs / stage.responses : 0,
      }))
      .sort((a, b) => a.order - b.order || a.module.localeCompare(b.module));

    if (!stages.length) continue;
    const first = stages[0];
    const last = stages[stages.length - 1];

    result.push({
      studyId,
      stages,
      first,
      last,
      accuracyDelta: last.accuracy - first.accuracy,
      timeDeltaMs: last.avgDecisionMs - first.avgDecisionMs,
      stageCount: stages.length,
    });
  }

  return result.sort((a, b) => a.studyId.localeCompare(b.studyId));
}

function buildAnchorRepeatedMeasures(rows) {
  const anchorRows = rows.filter((row) => row.studyId && row.anchorId);
  const grouped = new Map();

  for (const row of anchorRows) {
    const key = row.studyId + "||" + row.anchorId;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  return [...grouped.entries()].map(([key, values]) => {
    const [studyId, anchorId] = key.split("||");
    const stages = values
      .map((row) => ({
        module: row.module,
        label: MODULE_LABEL[row.module] || row.module,
        order: MODULE_ORDER[row.module] ?? 99,
        correct: Boolean(row.correct),
        decisionMs: Number(row.decisionMs ?? row.responseMs ?? 0),
      }))
      .sort((a, b) => a.order - b.order);

    return { studyId, anchorId, stages };
  }).sort((a, b) => a.studyId.localeCompare(b.studyId));
}

function Delta({ value, suffix = "", inverse = false }) {
  if (!Number.isFinite(value)) return <>—</>;
  const rounded = Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(2);
  const sign = value > 0 ? "+" : "";
  const direction = inverse ? -value : value;
  const label = direction > 0 ? "improved" : direction < 0 ? "declined" : "unchanged";
  return <span title={label}>{sign}{rounded}{suffix}</span>;
}

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
    group.responseMs += Number(row.decisionMs ?? row.responseMs ?? 0);
    group.rapid = (group.rapid || 0) + (row.rapidResponseFlag ? 1 : 0);
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
    rapidCount: group.rapid || 0,
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
  const [filters, setFilters] = useState({ course:"", section:"", semester:"", cohort:"", instructor:"", deliveryMode:"", module:"", question:"", studyId:"", concept:"", anchor:"", construct:"", cognitiveLevel:"", itemRole:"", discipline:"", transferType:"" });

  const filteredRows = useMemo(() => rows.filter((row) =>
    (!filters.course || row.course === filters.course) &&
    (!filters.section || row.section === filters.section) &&
    (!filters.semester || row.semester === filters.semester) &&
    (!filters.cohort || row.cohort === filters.cohort) &&
    (!filters.instructor || row.instructor === filters.instructor) &&
    (!filters.deliveryMode || row.deliveryMode === filters.deliveryMode) &&
    (!filters.module || row.module === filters.module) &&
    (!filters.question || row.questionId === filters.question) &&
    (!filters.studyId || row.studyId === filters.studyId) &&
    (!filters.concept || row.conceptTag === filters.concept) &&
    (!filters.anchor || row.anchorId === filters.anchor) &&
    (!filters.construct || row.construct === filters.construct) &&
    (!filters.cognitiveLevel || row.cognitiveLevel === filters.cognitiveLevel) &&
    (!filters.itemRole || row.itemRole === filters.itemRole) &&
    (!filters.discipline || row.discipline === filters.discipline) &&
    (!filters.transferType || row.transferType === filters.transferType)
  ), [rows, filters]);

  const optionValues = useMemo(() => ({
    course: [...new Set(rows.map(r=>r.course).filter(Boolean))].sort(),
    section: [...new Set(rows.map(r=>r.section).filter(Boolean))].sort(),
    semester: [...new Set(rows.map(r=>r.semester).filter(Boolean))].sort(),
    cohort: [...new Set(rows.map(r=>r.cohort).filter(Boolean))].sort(),
    instructor: [...new Set(rows.map(r=>r.instructor).filter(Boolean))].sort(),
    deliveryMode: [...new Set(rows.map(r=>r.deliveryMode).filter(Boolean))].sort(),
    module: [...new Set(rows.map(r=>r.module).filter(Boolean))].sort(),
    question: [...new Set(rows.map(r=>r.questionId).filter(Boolean))].sort(),
    studyId: [...new Set(rows.map(r=>r.studyId).filter(Boolean))].sort(),
    concept: [...new Set(rows.map(r=>r.conceptTag).filter(Boolean))].sort(),
    anchor: [...new Set(rows.map(r=>r.anchorId).filter(Boolean))].sort(),
    construct: [...new Set(rows.map(r=>r.construct).filter(Boolean))].sort(),
    cognitiveLevel: [...new Set(rows.map(r=>r.cognitiveLevel).filter(Boolean))].sort(),
    itemRole: [...new Set(rows.map(r=>r.itemRole).filter(Boolean))].sort(),
    discipline: [...new Set(rows.map(r=>r.discipline).filter(Boolean))].sort(),
    transferType: [...new Set(rows.map(r=>r.transferType).filter(Boolean))].sort(),
  }), [rows]);

  const computed = useMemo(() => {
    const source = filteredRows;
    const totalResponses = source.length;
    const correctResponses = source.filter((row) => row.correct).length;
    const avgResponseMs = totalResponses
      ? source.reduce((sum,row)=>sum+(row.decisionMs ?? row.responseMs ?? 0),0)/totalResponses
      : 0;
    const uniqueStudyIds = new Set(source.map((row)=>row.studyId).filter(Boolean)).size;
    const rapidResponses = source.filter((row)=>row.rapidResponseFlag).length;

    const moduleRuns = new Map();
    for (const row of source) {
      const key = [row.studyId || "", row.module || "", row.submittedAt || ""].join("|");
      if (!moduleRuns.has(key) && row.moduleElapsedMs != null) {
        moduleRuns.set(key, Number(row.moduleElapsedMs || 0));
      }
    }
    const avgModuleMs = moduleRuns.size
      ? [...moduleRuns.values()].reduce((sum,value)=>sum+value,0)/moduleRuns.size
      : 0;

    return { totalResponses, correctResponses, avgResponseMs, avgModuleMs, rapidResponses, uniqueStudyIds };
  }, [filteredRows]);

  const courseSummary = useMemo(() => summarize(filteredRows, r=>r.course), [filteredRows]);
  const semesterSummary = useMemo(() => summarize(filteredRows, r=>r.semester), [filteredRows]);
  const cohortSummary = useMemo(() => summarize(filteredRows, r=>r.cohort), [filteredRows]);
  const deliverySummary = useMemo(() => summarize(filteredRows, r=>r.deliveryMode), [filteredRows]);
  const moduleSummary = useMemo(() => summarize(filteredRows, r=>r.module), [filteredRows]);
  const questionSummary = useMemo(() => summarize(filteredRows, r=>r.questionId), [filteredRows]);
  const studentSummary = useMemo(() => summarize(filteredRows, r=>r.studyId), [filteredRows]);
  const anchorSummary = useMemo(() => summarize(filteredRows.filter(r=>r.anchorId), r=>r.anchorId), [filteredRows]);
  const constructSummary = useMemo(() => summarize(filteredRows, r=>r.construct), [filteredRows]);
  const cognitiveSummary = useMemo(() => summarize(filteredRows, r=>r.cognitiveLevel), [filteredRows]);
  const transferSummary = useMemo(() => summarize(filteredRows, r=>r.transferType), [filteredRows]);
  const repeatedMeasures = useMemo(() => buildRepeatedMeasures(filteredRows), [filteredRows]);
  const anchorRepeatedMeasures = useMemo(() => buildAnchorRepeatedMeasures(filteredRows), [filteredRows]);

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
    const headers=["studyId","semester","cohort","course","section","instructor","deliveryMode","module","questionId","conceptTag","anchorId","construct","cognitiveLevel","itemRole","discipline","transferType","choiceIndex","correct","attempt","firstAnswerMs","decisionMs","moduleElapsedMs","answerChanges","rapidResponseFlag","submittedAt"];
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
              {hasFilters && <button className="secondaryButton" type="button" onClick={()=>setFilters({course:"",section:"",semester:"",cohort:"",instructor:"",deliveryMode:"",module:"",question:"",studyId:"",concept:"",anchor:"",construct:"",cognitiveLevel:"",itemRole:"",discipline:"",transferType:""})}>Clear filters</button>}
            </div>
            <div className="filterGrid">
              {[
                ["semester","Semester"],["cohort","Cohort"],["course","Course"],
                ["section","Section"],["instructor","Instructor"],["deliveryMode","Delivery mode"],
                ["module","Module"],["question","Question"],["studyId","Study ID"],
                ["concept","Concept"],["anchor","Anchor family"],["construct","Construct"],
                ["cognitiveLevel","Cognitive level"],["itemRole","Item role"],
                ["discipline","Discipline"],["transferType","Transfer type"]
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
            <div className="statCard"><span>Avg. answer interval</span><strong>{computed.avgResponseMs?(computed.avgResponseMs/1000).toFixed(1)+" s":"—"}</strong></div>
            <div className="statCard"><span>Avg. module time</span><strong>{computed.avgModuleMs?(computed.avgModuleMs/1000).toFixed(1)+" s":"—"}</strong></div>
            <div className="statCard"><span>Rapid-response flags</span><strong>{computed.rapidResponses}</strong></div>
            <div className="statCard"><span>Study IDs</span><strong>{computed.uniqueStudyIds}</strong></div>
          </section>

          <section className="contentPanel">
            <div className="eyebrow">Timing interpretation</div>
            <h2>Response-time measures</h2>
            <p className="prototypeNote">
              Decision interval measures the time between a learner's first selections on successive questions.
              First-answer time is measured from assessment load, while module time is the total time to submission.
              A rapid-response flag marks a decision interval under 1.2 seconds; it is a review signal, not proof of guessing.
            </p>
          </section>

          <BarSummary title="Accuracy by Semester" rows={semesterSummary} />
          <BarSummary title="Accuracy by Cohort" rows={cohortSummary} />
          <BarSummary title="Accuracy by Delivery Mode" rows={deliverySummary} />
          <BarSummary title="Accuracy by Course" rows={courseSummary} />
          <BarSummary title="Accuracy by Module" rows={moduleSummary} />
          <SummaryTable title="Longitudinal Anchor Performance" rows={anchorSummary} showStudyCount />
          <BarSummary title="Accuracy by Construct" rows={constructSummary} />
          <BarSummary title="Accuracy by Cognitive Level" rows={cognitiveSummary} />
          <BarSummary title="Accuracy by Transfer Type" rows={transferSummary} />
          <SummaryTable title="Performance by Question" rows={questionSummary} />
          <SummaryTable title="Performance by Study ID" rows={studentSummary} />

          <section className="contentPanel">
            <div className="sectionHeader">
              <div>
                <div className="eyebrow">Repeated measures</div>
                <h2>Change by Study ID across modules</h2>
              </div>
            </div>
            <p className="prototypeNote">
              This view compares each Study ID's earliest and latest completed module in the current filter set.
              Accuracy change is descriptive only; students may have completed different numbers of stages.
            </p>
            {!repeatedMeasures.length ? (
              <p>No repeated-measures data are available yet.</p>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Study ID</th>
                      <th>Stages</th>
                      <th>First stage</th>
                      <th>First accuracy</th>
                      <th>Latest stage</th>
                      <th>Latest accuracy</th>
                      <th>Accuracy change</th>
                      <th>Decision-time change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedMeasures.map((student) => (
                      <tr key={student.studyId}>
                        <td>{student.studyId}</td>
                        <td>{student.stageCount}</td>
                        <td>{student.first.label}</td>
                        <td>{student.first.accuracy.toFixed(1)}%</td>
                        <td>{student.last.label}</td>
                        <td>{student.last.accuracy.toFixed(1)}%</td>
                        <td><Delta value={student.accuracyDelta} suffix=" pp" /></td>
                        <td><Delta value={student.timeDeltaMs / 1000} suffix=" s" inverse /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="contentPanel">
            <div className="sectionHeader">
              <div>
                <div className="eyebrow">Anchor progression</div>
                <h2>Longitudinal anchor items by Study ID</h2>
              </div>
            </div>
            <p className="prototypeNote">
              Each row shows how the same anchor family appears across the disciplinary sequence for a single anonymous Study ID.
            </p>
            {!anchorRepeatedMeasures.length ? (
              <p>No longitudinal anchor responses are available yet.</p>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Study ID</th>
                      <th>Anchor family</th>
                      <th>Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anchorRepeatedMeasures.map((record) => (
                      <tr key={record.studyId + record.anchorId}>
                        <td>{record.studyId}</td>
                        <td>{record.anchorId}</td>
                        <td>
                          {record.stages.map((stage, index) => (
                            <span key={stage.module + index} className="progressionStep">
                              {index > 0 ? " → " : ""}
                              {stage.label}: {stage.correct ? "Correct" : "Incorrect"} · {(stage.decisionMs / 1000).toFixed(1)} s
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>


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
                <thead><tr><th>Study ID</th><th>Semester</th><th>Cohort</th><th>Course</th><th>Section</th><th>Instructor</th><th>Mode</th><th>Module</th><th>Question</th><th>Concept</th><th>Anchor</th><th>Construct</th><th>Cognitive</th><th>Role</th><th>Discipline</th><th>Transfer</th><th>Correct</th><th>Attempt</th><th>Decision</th><th>First answer</th><th>Module</th><th>Changes</th><th>Rapid?</th><th>Submitted</th></tr></thead>
                <tbody>{filteredRows.map(row=><tr key={row.id}>
                  <td>{row.studyId||"—"}</td><td>{row.semester||"—"}</td><td>{row.cohort||"—"}</td><td>{row.course||"—"}</td><td>{row.section||"—"}</td><td>{row.instructor||"—"}</td><td>{row.deliveryMode||"—"}</td><td>{row.module}</td><td>{row.questionId}</td><td>{row.conceptTag||"—"}</td><td>{row.anchorId||"—"}</td><td>{row.construct||"—"}</td><td>{row.cognitiveLevel||"—"}</td><td>{row.itemRole||"—"}</td><td>{row.discipline||"—"}</td><td>{row.transferType||"—"}</td><td>{row.correct?"Yes":"No"}</td><td>{row.attempt}</td><td>{row.decisionMs!=null?(row.decisionMs/1000).toFixed(1)+" s":"—"}</td><td>{row.firstAnswerMs!=null?(row.firstAnswerMs/1000).toFixed(1)+" s":"—"}</td><td>{row.moduleElapsedMs!=null?(row.moduleElapsedMs/1000).toFixed(1)+" s":"—"}</td><td>{row.answerChanges??0}</td><td>{row.rapidResponseFlag?"Flag":"—"}</td><td>{row.submittedAt?new Date(row.submittedAt).toLocaleString():"—"}</td>
                </tr>)}</tbody>
              </table></div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
