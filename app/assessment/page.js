import Link from "next/link";
import QuestionSet from "../../components/QuestionSet";
import CaseRecord from "../../components/CaseRecord";
import { integratedQuestions } from "../../data/caseData";

export default function AssessmentPage() {
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

      <CaseRecord currentStage="integrated-assessment" />

      <section className="contentPanel">
        <QuestionSet
          questions={integratedQuestions}
          moduleId="integrated-assessment"
          submitLabel="Check integrated assessment"
        />
      </section>

      <div className="moduleNav">
        <Link href="/module/renal-response" className="secondaryLink">
          ← Return to A&P II
        </Link>
        <Link href="/" className="primaryLink">Return to case overview</Link>
      </div>
    </main>
  );
}
