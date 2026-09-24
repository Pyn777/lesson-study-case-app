"use client";

import { useMemo, useRef, useState } from "react";

const RESPONSE_KEY = "lessonStudyResponses";
const SESSION_KEY = "lessonStudySession";

export default function QuestionSet({
  questions,
  moduleId = "unknown",
  submitLabel = "Check answers",
}) {
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [saveState, setSaveState] = useState("idle");
  const startedAt = useRef(Date.now());
  const firstAnswerTimes = useRef({});
  const decisionTimes = useRef({});
  const answerChanges = useRef({});
  const lastFirstAnswerAt = useRef(Date.now());

  const score = useMemo(() => {
    return questions.reduce(
      (total, q) => total + (responses[q.id] === q.answer ? 1 : 0),
      0
    );
  }, [questions, responses]);

  function choose(questionId, choiceIndex) {
    if (submitted) return;

    const now = Date.now();
    const alreadyAnswered = Object.prototype.hasOwnProperty.call(
      responses,
      questionId
    );

    if (!alreadyAnswered) {
      firstAnswerTimes.current[questionId] = now - startedAt.current;
      decisionTimes.current[questionId] = now - lastFirstAnswerAt.current;
      lastFirstAnswerAt.current = now;
      answerChanges.current[questionId] = 0;
    } else if (responses[questionId] !== choiceIndex) {
      answerChanges.current[questionId] =
        (answerChanges.current[questionId] || 0) + 1;
    }

    setResponses((current) => ({ ...current, [questionId]: choiceIndex }));
  }

  function buildRows() {
    let session = {};
    try {
      session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "{}");
    } catch {}

    const submittedAt = new Date().toISOString();
    const moduleElapsedMs = Date.now() - startedAt.current;

    return questions.map((question) => {
      const firstAnswerMs =
        firstAnswerTimes.current[question.id] ?? moduleElapsedMs;
      const decisionMs =
        decisionTimes.current[question.id] ?? moduleElapsedMs;
      const changes = answerChanges.current[question.id] || 0;

      return {
      studyId: session.studyId || "",
      course: session.course || "",
      section: session.section || "",
      module: moduleId,
      questionId: question.id,
      conceptTag: question.conceptTag || "",
      anchorId: question.anchorId || "",
      choiceIndex: responses[question.id],
      correct: responses[question.id] === question.answer,
      attempt,
      responseMs: decisionMs,
      firstAnswerMs,
      decisionMs,
      moduleElapsedMs,
      answerChanges: changes,
      rapidResponseFlag: decisionMs < 1200,
      submittedAt,
      };
    });
  }

  function saveLocal(rows) {
    let existing = [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(RESPONSE_KEY) || "[]");
      existing = Array.isArray(parsed) ? parsed : [];
    } catch {}

    window.localStorage.setItem(
      RESPONSE_KEY,
      JSON.stringify([...existing, ...rows])
    );
  }

  async function savePersistent(rows) {
    try {
      setSaveState("saving");
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      if (!response.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("local-only");
    }
  }

  async function submit() {
    const rows = buildRows();
    saveLocal(rows);
    setSubmitted(true);
    await savePersistent(rows);
  }

  function reset() {
    setResponses({});
    setSubmitted(false);
    setAttempt((current) => current + 1);
    setSaveState("idle");
    startedAt.current = Date.now();
    firstAnswerTimes.current = {};
    decisionTimes.current = {};
    answerChanges.current = {};
    lastFirstAnswerAt.current = Date.now();
  }

  return (
    <div className="questionSet">
      {questions.map((question, qIndex) => {
        const selected = responses[question.id];
        const isCorrect = selected === question.answer;

        return (
          <section className="questionCard" key={question.id}>
            <div className="questionNumber">Question {qIndex + 1}</div>
            <h3>{question.prompt}</h3>

            <div className="choiceList">
              {question.choices.map((choice, index) => {
                const selectedClass = selected === index ? " selected" : "";
                let resultClass = "";
                if (submitted && index === question.answer) resultClass = " correct";
                if (submitted && selected === index && index !== question.answer)
                  resultClass = " incorrect";

                return (
                  <button
                    key={choice}
                    type="button"
                    className={"choiceButton" + selectedClass + resultClass}
                    onClick={() => choose(question.id, index)}
                  >
                    <span className="choiceLetter">{String.fromCharCode(65 + index)}</span>
                    <span>{choice}</span>
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className={isCorrect ? "feedback correctText" : "feedback"}>
                <strong>{isCorrect ? "Correct." : "Review this one."}</strong>{" "}
                {question.explanation}
              </div>
            )}
          </section>
        );
      })}

      <div className="assessmentActions">
        {!submitted ? (
          <button
            className="primaryButton"
            type="button"
            onClick={submit}
            disabled={Object.keys(responses).length !== questions.length}
          >
            {submitLabel}
          </button>
        ) : (
          <>
            <div className="scoreBox">
              Score: <strong>{score}/{questions.length}</strong>
            </div>
            <button className="secondaryButton" type="button" onClick={reset}>
              Try again
            </button>
          </>
        )}
      </div>

      {submitted && (
        <p className="prototypeNote">
          {saveState === "saving" && "Saving response data…"}
          {saveState === "saved" &&
            "Response data saved to the shared study database. Timing includes per-question decision intervals and total module time."}
          {saveState === "local-only" &&
            "Database save is not available yet. A local browser copy was kept instead."}
        </p>
      )}
    </div>
  );
}
