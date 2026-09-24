import Link from "next/link";
import UrinalysisIntegration from "../../components/UrinalysisIntegration";

export const dynamic = "force-dynamic";

export default function UrinalysisPage() {
  return (
    <main className="shell">
      <Link href="/module/microbiology" className="backLink">← Back to Microbiology lens</Link>

      <section className="assessmentHero">
        <div className="eyebrow">Microbiology extension</div>
        <h1>Urinalysis Clinical Simulation</h1>
        <p className="lead">
          Use the existing urinalysis simulation as a deeper laboratory extension of the shared interdisciplinary case.
        </p>
      </section>

      <UrinalysisIntegration />

      <nav className="moduleNav">
        <Link href="/module/microbiology" className="secondaryLink">← Return to Microbiology</Link>
        <Link href="/module/renal-response" className="primaryLink">Continue to renal lens →</Link>
      </nav>
    </main>
  );
}
