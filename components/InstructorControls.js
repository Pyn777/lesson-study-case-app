"use client";

import { useEffect, useMemo, useState } from "react";
import { integratedQuestions, modules } from "../data/caseData";

const MODULES = [
  ...Object.entries(modules)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([id, module]) => ({
      id,
      label: module.course + " — " + module.lens,
    })),
  { id: "integrated-assessment", label: "Integrated Assessment" },
];

const ANCHOR_CANDIDATES = [
  ...Object.entries(modules).flatMap(([moduleId, module]) =>
    module.questions.map((question) => ({
      id: question.id,
      moduleId,
      label: question.id + " — " + question.prompt,
      defaultAnchor: Boolean(question.anchorId),
    }))
  ),
  ...integratedQuestions.map((question) => ({
    id: question.id,
    moduleId: "integrated-assessment",
    label: question.id + " — " + question.prompt,
    defaultAnchor: Boolean(question.anchorId),
  })),
];

export default function InstructorControls({ accessKey }) {
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load settings.");
        if (!active) return;
        setSettings(data.settings);
        setDraft(data.settings);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setMessage(error.message || "Unable to load settings.");
        setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const activeModuleSet = useMemo(
    () => new Set(draft?.activeModules || []),
    [draft]
  );
  const activeAnchorSet = useMemo(
    () => new Set(draft?.activeAnchorQuestionIds || []),
    [draft]
  );

  function toggleModule(id) {
    const next = new Set(activeModuleSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDraft((current) => ({
      ...current,
      activeModules: MODULES.map((item) => item.id).filter((moduleId) =>
        next.has(moduleId)
      ),
    }));
    setMessage("");
  }

  function toggleAnchor(id) {
    const next = new Set(activeAnchorSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDraft((current) => ({
      ...current,
      activeAnchorQuestionIds: ANCHOR_CANDIDATES.map((item) => item.id).filter(
        (questionId) => next.has(questionId)
      ),
    }));
    setMessage("");
  }

  async function save() {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-instructor-key": accessKey,
        },
        body: JSON.stringify({
          activeModules: draft.activeModules,
          activeAnchorQuestionIds: draft.activeAnchorQuestionIds,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save settings.");
      setSettings(data.settings);
      setDraft(data.settings);
      setStatus("ready");
      setMessage("Settings saved. Student pages will use the updated configuration.");
    } catch (error) {
      setStatus("ready");
      setMessage(error.message || "Unable to save settings.");
    }
  }

  function resetDraft() {
    setDraft(settings);
    setMessage("");
  }

  if (status === "loading") {
    return (
      <section className="contentPanel">
        <div className="eyebrow">Instructor controls</div>
        <h2>Study configuration</h2>
        <p>Loading settings…</p>
      </section>
    );
  }

  if (!draft) {
    return (
      <section className="contentPanel">
        <div className="eyebrow">Instructor controls</div>
        <h2>Study configuration</h2>
        <p className="errorText">{message || "Settings are unavailable."}</p>
      </section>
    );
  }

  return (
    <section className="contentPanel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">Instructor controls</div>
          <h2>Study configuration</h2>
        </div>
        <div className="buttonRow">
          <button
            type="button"
            className="secondaryButton"
            onClick={resetDraft}
            disabled={status === "saving"}
          >
            Reset unsaved changes
          </button>
          <button
            type="button"
            className="primaryButton"
            onClick={save}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      <p className="prototypeNote">
        Deactivating a module hides it from the student sequence. Anchor controls
        determine which questions are tagged as longitudinal anchors in newly
        submitted response data; existing data are not rewritten.
      </p>

      <div className="controlGrid">
        <div className="controlGroup">
          <h3>Active modules</h3>
          {MODULES.map((item) => (
            <label className="toggleRow" key={item.id}>
              <input
                type="checkbox"
                checked={activeModuleSet.has(item.id)}
                onChange={() => toggleModule(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <div className="controlGroup">
          <h3>Longitudinal anchor questions</h3>
          {ANCHOR_CANDIDATES.map((item) => (
            <label className="toggleRow anchorToggle" key={item.id}>
              <input
                type="checkbox"
                checked={activeAnchorSet.has(item.id)}
                onChange={() => toggleAnchor(item.id)}
              />
              <span>
                {item.label}
                {item.defaultAnchor ? <small>Current designed anchor</small> : null}
              </span>
            </label>
          ))}
        </div>
      </div>

      {message ? <p className="prototypeNote controlMessage">{message}</p> : null}
    </section>
  );
}
