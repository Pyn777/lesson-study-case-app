"use client";

import { useMemo, useState } from "react";

export default function QuestionSet({ questions, submitLabel = "Check answers" }) {
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  function reset() {
    setResponses({});
    setSubmitted(false);
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
            onClick={() => setSubmitted(true)}
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
        Prototype only: responses are not stored yet. Persistent longitudinal data will be added after the student flow is finalized.
      </p>
    </div>
  );
}
