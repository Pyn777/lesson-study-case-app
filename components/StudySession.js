"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lessonStudySession";

export default function StudySession() {
  const [studyId, setStudyId] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setStudyId(parsed.studyId || "");
        setCourse(parsed.course || "");
        setSection(parsed.section || "");
        setSaved(Boolean(parsed.studyId));
      } catch {}
    }
  }, []);

  function saveSession(e) {
    e.preventDefault();
    const cleanId = studyId.trim();
    if (!cleanId) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        studyId: cleanId,
        course,
        section: section.trim(),
        startedAt: new Date().toISOString(),
      })
    );
    setSaved(true);
  }

  function clearSession() {
    window.localStorage.removeItem(STORAGE_KEY);
    setStudyId("");
    setCourse("");
    setSection("");
    setSaved(false);
  }

  if (saved) {
    return (
      <section className="sessionCard sessionSaved">
        <div>
          <div className="eyebrow">Study session active</div>
          <strong>{studyId}</strong>
          <span>
            {course || "Course not selected"}
            {section ? " · " + section : ""}
          </span>
        </div>
        <button type="button" className="secondaryButton" onClick={clearSession}>
          Change session
        </button>
      </section>
    );
  }

  return (
    <section className="sessionCard">
      <div>
        <div className="eyebrow">Optional study session</div>
        <h2>Set an anonymous study ID</h2>
        <p>
          Use a study code rather than a student name. This prototype stores the
          session only in this browser.
        </p>
      </div>

      <form className="sessionForm" onSubmit={saveSession}>
        <label>
          Study ID
          <input
            value={studyId}
            onChange={(e) => setStudyId(e.target.value)}
            placeholder="e.g., F26-014"
            required
          />
        </label>

        <label>
          Course
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">Select course</option>
            <option>General Biology</option>
            <option>A&P I</option>
            <option>Microbiology</option>
            <option>A&P II</option>
          </select>
        </label>

        <label>
          Section (optional)
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., W02"
          />
        </label>

        <button className="primaryButton" type="submit">
          Start session
        </button>
      </form>
    </section>
  );
}
