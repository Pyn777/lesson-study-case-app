"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lessonStudySession";

export default function StudySession() {
  const [studyId, setStudyId] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("Fall 2026");
  const [cohort, setCohort] = useState("");
  const [instructor, setInstructor] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setStudyId(parsed.studyId || "");
        setCourse(parsed.course || "");
        setSection(parsed.section || "");
        setSemester(parsed.semester || "Fall 2026");
        setCohort(parsed.cohort || "");
        setInstructor(parsed.instructor || "");
        setDeliveryMode(parsed.deliveryMode || "");
        setPrivacyAcknowledged(Boolean(parsed.privacyAcknowledged));
        setSaved(Boolean(parsed.studyId));
      } catch {}
    }
  }, []);

  function saveSession(e) {
    e.preventDefault();
    const cleanId = studyId.trim();
    if (!cleanId || !privacyAcknowledged) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        studyId: cleanId,
        course,
        section: section.trim(),
        semester: semester.trim(),
        cohort: cohort.trim(),
        instructor: instructor.trim(),
        deliveryMode,
        privacyAcknowledged: true,
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
    setSemester("Fall 2026");
    setCohort("");
    setInstructor("");
    setDeliveryMode("");
    setPrivacyAcknowledged(false);
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
            {semester ? " · " + semester : ""}
            {deliveryMode ? " · " + deliveryMode : ""}
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
          Use only an assigned study code. Do not enter a student name, email
          address, college ID, or other directly identifying information.
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

        <label>
          Semester
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g., Fall 2026"
          />
        </label>

        <label>
          Cohort (optional)
          <input
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            placeholder="e.g., 2026–27 pilot"
          />
        </label>

        <label>
          Instructor (optional)
          <input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="e.g., Payne"
          />
        </label>

        <label>
          Delivery mode (optional)
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
          >
            <option value="">Select mode</option>
            <option>Online</option>
            <option>On-ground</option>
            <option>Hybrid</option>
          </select>
        </label>

        <label className="privacyAcknowledge">
          <input
            type="checkbox"
            checked={privacyAcknowledged}
            onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
            required
          />
          <span>
            I understand that I should use only an anonymous study code and not
            enter my name, email address, or college ID.
          </span>
        </label>

        <button className="primaryButton" type="submit" disabled={!privacyAcknowledged}>
          Start session
        </button>
      </form>
    </section>
  );
}
