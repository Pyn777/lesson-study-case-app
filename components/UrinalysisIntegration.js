"use client";

import { useEffect, useMemo, useState } from "react";

const SESSION_KEY = "lessonStudySession";
const SIMULATION_ORIGIN = "https://urinalysis-simulation.vercel.app";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "ua-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

export default function UrinalysisIntegration() {
  const [session, setSession] = useState({});
  const [result, setResult] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setSession(JSON.parse(window.localStorage.getItem(SESSION_KEY) || "{}"));
    } catch {
      setSession({});
    }
  }, []);

  useEffect(() => {
    async function handleMessage(event) {
      if (event.origin !== SIMULATION_ORIGIN) return;
      if (event.data?.type !== "urinalysis-simulation-result") return;

      const payload = {
        ...event.data,
        integrationId: makeId(),
        sessionId: session.sessionId || "",
        studyId: session.studyId || event.data.studyId || "",
        semester: session.semester || "",
        course: session.course || "",
        section: session.section || "",
      };

      setResult(payload);
      setSaveState("saving");
      setMessage("");

      try {
        const response = await fetch("/api/urinalysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to save urinalysis result.");
        setSaveState("saved");
        setMessage(
          data.duplicate
            ? "This urinalysis result had already been received."
            : "Urinalysis result saved to the shared Lesson Study database."
        );
      } catch (error) {
        setSaveState("error");
        setMessage(error.message || "Unable to save urinalysis result.");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [session]);

  const src = useMemo(() => {
    const params = new URLSearchParams({ integrated: "1" });
    if (session.studyId) params.set("studyId", session.studyId);
    return SIMULATION_ORIGIN + "/?" + params.toString();
  }, [session.studyId]);

  return (
    <>
      <section className="contentPanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">Existing Microbiology simulation</div>
            <h2>Urinalysis Clinical Simulation</h2>
          </div>
        </div>
        <p>
          This is the existing urinalysis simulation embedded into the shared Lesson Study case.
          Complete the assigned urinalysis case, culture/Gram-stain reasoning, and identification sequence.
        </p>
        <p className="prototypeNote">
          Your anonymous Study ID is passed into the simulation when available. When you click
          Grade in the simulation, a structured result summary is sent back to this app and stored
          with the same Study ID.
        </p>
      </section>

      <div className="simulationFrameWrap">
        <iframe
          className="simulationFrame"
          src={src}
          title="Urinalysis Clinical Simulation"
          allow="clipboard-write"
        />
      </div>

      {result ? (
        <section className="contentPanel">
          <div className="eyebrow">Urinalysis handoff</div>
          <h2>Result returned to the shared case</h2>
          <div className="urinalysisResultGrid">
            <div><span>Case</span><strong>{result.caseTitle || result.caseId}</strong></div>
            <div><span>Score</span><strong>{result.score}/{result.outOf}</strong></div>
            <div><span>Final identification</span><strong>{result.finalIdentification || "—"}</strong></div>
            <div><span>Expected organism</span><strong>{result.organism || "—"}</strong></div>
            <div><span>Gram reaction</span><strong>{result.gramReaction || "—"}</strong></div>
            <div><span>Rapid test</span><strong>{result.rapidTest || "—"}</strong></div>
            <div><span>Follow-up test</span><strong>{result.followupTest || "—"}</strong></div>
          </div>
          <p className="prototypeNote">
            {saveState === "saving" ? "Saving result…" : message}
          </p>
        </section>
      ) : null}
    </>
  );
}
