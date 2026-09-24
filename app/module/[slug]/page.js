import Link from "next/link";
import { notFound } from "next/navigation";
import QuestionSet from "../../../components/QuestionSet";
import { modules, sharedCase } from "../../../data/caseData";

export function generateStaticParams() {
  return Object.keys(modules).map((slug) => ({ slug }));
}

export default async function ModulePage({ params }) {
  const { slug } = await params;
  const module = modules[slug];

  if (!module) notFound();

  const ordered = Object.entries(modules)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([moduleSlug]) => moduleSlug);

  const currentIndex = ordered.indexOf(slug);
  const nextSlug = ordered[currentIndex + 1];

  return (
    <main className="shell">
      <Link href="/" className="backLink">← Back to case overview</Link>

      <section className={"moduleHero " + module.colorClass}>
        <div>
          <div className="eyebrow">Case Lens {module.order}</div>
          <h1>{module.course}</h1>
          <p className="lead">{module.lens}</p>
        </div>
        <div className="moduleStep">Step {module.order} of 3</div>
      </section>

      <section className="caseUpdate">
        <span className="pill">Case update</span>
        <h2>{sharedCase.title}</h2>
        <p>{module.caseUpdate}</p>
      </section>

      <section className="contentPanel">
        <h2>Learning focus</h2>
        <ul className="objectiveList">
          {module.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>

      <section className="contentPanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">Checkpoint</div>
            <h2>Apply the case</h2>
          </div>
          <p>Answer all questions before checking your responses.</p>
        </div>
        <QuestionSet questions={module.questions} />
      </section>

      <nav className="moduleNav">
        <Link href="/" className="secondaryLink">Case overview</Link>
        {nextSlug ? (
          <Link href={"/module/" + nextSlug} className="primaryLink">
            Continue to next lens →
          </Link>
        ) : (
          <Link href="/assessment" className="primaryLink">
            Continue to integrated assessment →
          </Link>
        )}
      </nav>
    </main>
  );
}
