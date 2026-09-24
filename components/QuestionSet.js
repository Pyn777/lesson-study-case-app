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
  const startedAt = useRef(Date.now());

  const score = useMemo(() => {
    return questions.reduce(
      (total, q) => total + (responses[q.id] === q.answer ? 1 : 0),
      0
    );
  }, [questions, responses]);

  function choose(questionId, choiceIndex) {
    if (submitted) return;
    setResponses((current) => ({ ...current, [questionId]: choiceIndex }));
  }

  function recordResults() {
    let session = {};
    try {
      session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "{}");
    } catch {}

    let existing = [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(RESPONSE_KEY) || "[]");
      existing = Array.isArray(parsed) ? parsed : [];
    } catch {}

    const submittedAt = new Date().toISOString();
    const elapsed = Date.now() - startedAt.current;

    const newRows = questions.map((question) => ({
      studyId: session.studyId || "",
      course: session.course || "",
      section: session.section || "",
      module: moduleId,
      questionId: question.id,
      choiceIndex: responses[question.id],
      correct: responses[question.id] === question.answer,
      attempt,
      responseMs: elapsed,
      submittedAt,
    }));

    window.localStorage.setItem(
      RESPONSE_KEY,
      JSON.stringify([...existing, ...newRows])
    );
  }

  function submit() {
    recordResults();
    setSubmitted(true);
  }

  function reset() {
    setResponses({});
    setSubmitted(false);
    setAttempt((current) => current + 1);
    startedAt.current = Date.now();
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

      <p className="prototypeNote">
        Prototype tracking records correctness, attempt number, and elapsed response
        time in this browser only.
      </p>
    </div>
  );
}
