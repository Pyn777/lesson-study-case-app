"use client";

import { useMemo, useState } from "react";

const SESSION_KEY = "lessonStudySession";
const ROLEPLAY_KEY = "lessonStudyRolePlay";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "role-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

export default function RolePlayActivity({ moduleId, activity }) {
  const [roleName, setRoleName] = useState("");
  const [claimText, setClaimText] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [actionText, setActionText] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const complete = useMemo(
    () => roleName && claimText && evidenceText && actionText,
    [roleName, claimText, evidenceText, actionText]
  );

  async function saveHandoff() {
    if (!complete) return;

    let session = {};
    try {
      session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "{}");
    } catch {}

    const entry = {
      roleplayId: makeId(),
      sessionId: session.sessionId || "",
      studyId: session.studyId || "",
      semester: session.semester || "",
      course: session.course || "",
      section: session.section || "",
      module: moduleId,
      roleName,
      claimText,
      evidenceText,
      actionText,
      submittedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(window.localStorage.getItem(ROLEPLAY_KEY) || "[]");
      window.localStorage.setItem(
        ROLEPLAY_KEY,
        JSON.stringify([...(Array.isArray(existing) ? existing : []), entry])
      );
    } catch {}

    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save handoff.");
      setStatus("saved");
      setMessage(
        data.duplicate
          ? "This handoff had already been received."
          : "Structured handoff saved to the shared study database."
      );
    } catch (error) {
      setStatus("local-only");
      setMessage(
        "The handoff was kept in this browser, but the shared database save was not available."
      );
    }
  }

  return (
    <section className="contentPanel rolePlayPanel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">Interdisciplinary communication</div>
          <h2>{activity.title}</h2>
        </div>
      </div>

      <p>{activity.prompt}</p>
      <p className="prototypeNote">
        This activity uses predefined choices rather than free-text notes so the handoff stays structured and does not invite personally identifying information.
      </p>

      <div className="rolePlayGrid">
        <label>
          Professional role
          <select value={roleName} onChange={(e) => setRoleName(e.target.value)}>
            <option value="">Select role</option>
            {activity.roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>

        <label>
          Main claim
          <select value={claimText} onChange={(e) => setClaimText(e.target.value)}>
            <option value="">Select claim</option>
            {activity.claims.map((claim) => (
              <option key={claim} value={claim}>{claim}</option>
            ))}
          </select>
        </label>

        <label>
          Evidence to communicate
          <select value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)}>
            <option value="">Select evidence</option>
            {activity.evidenceOptions.map((evidence) => (
              <option key={evidence} value={evidence}>{evidence}</option>
            ))}
          </select>
        </label>

        <label>
          Recommended handoff action
          <select value={actionText} onChange={(e) => setActionText(e.target.value)}>
            <option value="">Select action</option>
            {activity.actions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </label>
      </div>

      {complete && (
        <div className="handoffPreview">
          <div className="eyebrow">Handoff preview</div>
          <p>
            <strong>{roleName}:</strong> {claimText} <strong>Evidence:</strong>{" "}
            {evidenceText} <strong>Next step:</strong> {actionText}
          </p>
        </div>
      )}

      <div className="assessmentActions">
        <button
          type="button"
          className="primaryButton"
          disabled={!complete || status === "saving"}
          onClick={saveHandoff}
        >
          {status === "saving" ? "Saving…" : "Save handoff"}
        </button>
      </div>

      {message ? <p className="prototypeNote">{message}</p> : null}
    </section>
  );
}
