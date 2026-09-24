"use client";

import { useEffect, useMemo, useState } from "react";
import { integratedFinding, modules } from "../data/caseData";

const PROGRESS_KEY = "lessonStudyCaseProgress";

const stages = [
  ...Object.entries(modules)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([slug, module]) => ({
      id: slug,
      order: module.order,
      title: module.course,
      lens: module.lens,
      finding: module.caseFinding,
    })),
  {
    id: "integrated-assessment",
    order: 4,
    title: "Integrated Assessment",
    lens: "Synthesis",
    finding: integratedFinding,
  },
];

export default function CaseRecord({ currentStage = null, compact = false }) {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    function loadProgress() {
      try {
        setProgress(
          JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || "{}")
        );
      } catch {
        setProgress({});
      }
    }

    loadProgress();
    window.addEventListener("storage", loadProgress);
    window.addEventListener("lesson-study-progress-updated", loadProgress);
    return () => {
      window.removeEventListener("storage", loadProgress);
      window.removeEventListener("lesson-study-progress-updated", loadProgress);
    };
  }, []);

  const visibleStages = useMemo(() => {
    return stages.filter((stage) => {
      if (progress[stage.id]?.completed) return true;
      if (currentStage && stage.id === currentStage) return true;

      const current = stages.find((item) => item.id === currentStage);
      return current && stage.order < current.order;
    });
  }, [progress, currentStage]);

  return (
    <section className={"caseRecord " + (compact ? "caseRecordCompact" : "")}>
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">Accumulating case record</div>
          <h2>What we know so far</h2>
        </div>
        <span className="caseRecordCount">
          {Object.values(progress).filter((item) => item?.completed).length}/4 completed
        </span>
      </div>

      {!visibleStages.length ? (
        <p className="prototypeNote">
          Findings will accumulate here as the case progresses through each disciplinary lens.
        </p>
      ) : (
        <div className="caseTimeline">
          {visibleStages.map((stage) => {
            const completed = Boolean(progress[stage.id]?.completed);
            const isCurrent = stage.id === currentStage && !completed;
            const result = progress[stage.id];

            return (
              <article
                className={
                  "caseTimelineItem" +
                  (completed ? " completed" : "") +
                  (isCurrent ? " current" : "")
                }
                key={stage.id}
              >
                <div className="caseTimelineMarker">{stage.order}</div>
                <div className="caseTimelineBody">
                  <div className="caseTimelineTopline">
                    <div>
                      <strong>{stage.title}</strong>
                      <span>{stage.lens}</span>
                    </div>
                    <span className="caseStatus">
                      {completed ? "Added to record" : "Current lens"}
                    </span>
                  </div>

                  <h3>{stage.finding.label}</h3>
                  <p>{stage.finding.summary}</p>

                  <ul className="caseEvidence">
                    {stage.finding.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {completed && result?.total ? (
                    <div className="caseCheckpoint">
                      Checkpoint: {result.score}/{result.total}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
