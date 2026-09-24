import Link from "next/link";
import QuestionSet from "../../components/QuestionSet";
import CaseRecord from "../../components/CaseRecord";
import { integratedQuestions } from "../../data/caseData";
import { getStudySettings } from "../../lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AssessmentPage() {
  const settings = await getStudySettings();
  if (!settings.activeModules.includes("integrated-assessment")) notFound();
  const previousModule = ["renal-response", "microbiology", "cellular-foundation"]
    .find((id) => settings.activeModules.includes(id));
  return (
    <main className="shell">
      <Link href="/" className="backLink">← Back to case overview</Link>

      <section className="assessmentHero">
        <div className="eyebrow">Integrated assessment</div>
        <h1>Bring the disciplines together</h1>
        <p className="lead">
          Use the shared case to connect the infectious cause, cellular fluid shifts,
          and whole-body renal response.
        </p>
      </section>

      <CaseRecord currentStage="integrated-assessment" activeModules={settings.activeModules} />

      <section className="contentPanel">
        <QuestionSet
          questions={integratedQuestions}
          moduleId="integrated-assessment"
          activeAnchorQuestionIds={settings.activeAnchorQuestionIds}
          submitLabel="Check integrated assessment"
        />
      </section>

      <div className="moduleNav">
        {previousModule ? (
          <Link href={"/module/" + previousModule} className="secondaryLink">
            ← Return to previous lens
          </Link>
        ) : (
          <Link href="/" className="secondaryLink">
            ← Return to case overview
          </Link>
        )}
        <Link href="/" className="primaryLink">Return to case overview</Link>
      </div>
    </main>
  );
}
