import Link from "next/link";
import StudySession from "../components/StudySession";
import CaseRecord from "../components/CaseRecord";
import { modules, sharedCase } from "../data/caseData";
import { getStudySettings } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getStudySettings();
  const moduleEntries = Object.entries(modules)
    .filter(([slug]) => settings.activeModules.includes(slug))
    .sort((a, b) => a[1].order - b[1].order);
  const integratedActive = settings.activeModules.includes("integrated-assessment");
  const firstActiveSlug = moduleEntries[0]?.[0] || null;
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Lesson Study Prototype</div>
        <h1>Interdisciplinary Case Study App</h1>
        <p className="lead">
          One longitudinal case, revisited through multiple disciplinary lenses.
        </p>
      </section>

      <section className="caseCard">
        <div>
          <span className="pill">Shared case</span>
          <h2>{sharedCase.title}</h2>
          <p>{sharedCase.intro}</p>
        </div>
        <div className="caseMeta">
          <strong>Different lenses, one common problem.</strong>
          <span>Introduce early, revisit across courses, deepen understanding.</span>
        </div>
      </section>

      <section className="privacyBanner">
        <div>
          <strong>Use an anonymous Study ID only.</strong>
          <span>
            Do not enter names, email addresses, college IDs, or other directly identifying information.
          </span>
        </div>
        <Link href="/privacy" className="secondaryLink">Privacy & data use</Link>
      </section>

      <StudySession />
      <CaseRecord compact activeModules={settings.activeModules} />

      <section className="progressStrip" aria-label="Course progression">
        {moduleEntries.map(([slug, module], index) => (
          <div className="progressItem" key={slug}>
            <span className="progressNumber">{module.order}</span>
            <span>{module.lens}</span>
            {index < moduleEntries.length - 1 && <span className="progressArrow">→</span>}
          </div>
        ))}
        {integratedActive && (
          <div className="progressItem">
            <span className="progressNumber">4</span>
            <span>Integrated Assessment</span>
          </div>
        )}
      </section>

      <section className="grid">
        {moduleEntries.map(([slug, module]) => (
          <article key={slug} className={"module " + module.colorClass}>
            <div className="moduleNumber">{module.order}</div>
            <h3>{module.course}</h3>
            <p className="subtitle">{module.lens}</p>
            <ul>
              {module.objectives.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <Link className="cardButton" href={"/module/" + slug}>
              Open module
            </Link>
          </article>
        ))}
      </section>

      <section className="shared">
        <h2>Shared Elements Across Courses</h2>
        <div className="sharedGrid">
          <div>
            <strong>Shared assessment items</strong>
            <span>Common or equivalent questions can appear across modules.</span>
          </div>
          <div>
            <strong>Aligned learning outcomes</strong>
            <span>Each course keeps its own disciplinary objective.</span>
          </div>
          <div>
            <strong>Longitudinal data</strong>
            <span>Planned tracking includes accuracy, attempts, and response time.</span>
          </div>
          <div>
            <strong>Communication / role play</strong>
            <span>Students can interpret the case from different professional perspectives.</span>
          </div>
        </div>
      </section>

      <section className="next">
        <div>
          <div className="eyebrow">Current build</div>
          <h2>Longitudinal case and study tools are active</h2>
          <p>
            The app now includes the shared case sequence, persistent response storage,
            longitudinal timing and anchor data, instructor controls, data-quality checks,
            and a protected instructor dashboard.
          </p>
        </div>
        <div className="buttonRow">
          <Link href="/results" className="secondaryLink">Instructor dashboard</Link>
          {firstActiveSlug ? (
            <Link href={"/module/" + firstActiveSlug} className="primaryLink">
              Start the case →
            </Link>
          ) : integratedActive ? (
            <Link href="/assessment" className="primaryLink">
              Start integrated assessment →
            </Link>
          ) : (
            <span className="prototypeNote">No student modules are active.</span>
          )}
        </div>
      </section>
    </main>
  );
}
