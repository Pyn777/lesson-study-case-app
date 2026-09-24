import Link from "next/link";
import StudySession from "../components/StudySession";
import { modules, sharedCase } from "../data/caseData";

const moduleEntries = Object.entries(modules).sort(
  (a, b) => a[1].order - b[1].order
);

export default function HomePage() {
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

      <StudySession />

      <section className="progressStrip" aria-label="Course progression">
        {moduleEntries.map(([slug, module], index) => (
          <div className="progressItem" key={slug}>
            <span className="progressNumber">{module.order}</span>
            <span>{module.lens}</span>
            {index < moduleEntries.length - 1 && <span className="progressArrow">→</span>}
          </div>
        ))}
        <div className="progressItem">
          <span className="progressNumber">4</span>
          <span>Integrated Assessment</span>
        </div>
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
          <h2>Student flow is now interactive</h2>
          <p>
            The first version includes the shared case, three course lenses, question
            feedback, and an integrated assessment. Data storage and the instructor
            dashboard come next.
          </p>
        </div>
        <div className="buttonRow">
          <Link href="/results" className="secondaryLink">View local results</Link>
          <Link href="/module/cellular-foundation" className="primaryLink">
            Start the case →
          </Link>
        </div>
      </section>
    </main>
  );
}
