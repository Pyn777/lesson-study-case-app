import Link from "next/link";
import UrinalysisIntegration from "../../components/UrinalysisIntegration";
import { getStudySettings } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function UrinalysisPage() {
  const settings = await getStudySettings();
  const nextModule = ["renal-response", "integrated-assessment"]
    .find((id) => settings.activeModules.includes(id));
  const nextHref = nextModule === "integrated-assessment"
    ? "/assessment"
    : nextModule
      ? "/module/" + nextModule
      : "/";
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
        <Link href={nextHref} className="primaryLink">Continue through the case →</Link>
      </nav>
    </main>
  );
}
