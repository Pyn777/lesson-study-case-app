import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="shell">
      <Link href="/" className="backLink">← Back to case overview</Link>

      <section className="assessmentHero">
        <div className="eyebrow">Privacy & data use</div>
        <h1>How study data are handled</h1>
        <p className="lead">
          This app is designed to use anonymous study codes rather than student names.
        </p>
      </section>

      <section className="contentPanel">
        <h2>What the study database stores</h2>
        <ul className="objectiveList">
          <li>Anonymous Study ID entered by the participant</li>
          <li>Course, section, semester, cohort, instructor, and delivery mode when supplied</li>
          <li>Question responses, correctness, attempts, and item metadata</li>
          <li>Response-time measures, answer changes, and rapid-response review flags</li>
          <li>Submission/session identifiers and submission timestamps used for duplicate protection and auditability</li>
        </ul>
      </section>

      <section className="contentPanel">
        <h2>What should not be entered</h2>
        <p>
          Do not enter names, email addresses, college identification numbers, phone
          numbers, or other directly identifying information into the Study ID or
          session fields.
        </p>
        <p className="prototypeNote">
          The application database is not designed to intentionally store names,
          email addresses, college IDs, or IP addresses as study fields.
        </p>
      </section>

      <section className="contentPanel">
        <h2>Instructional use and research use</h2>
        <p>
          These privacy controls support classroom Lesson Study and longitudinal
          instructional analysis. They are not a substitute for institution-approved
          research procedures. If the data are used for formal research, publication,
          or dissemination beyond routine instructional improvement, the research team
          should follow applicable institutional review, consent, privacy, and data-governance requirements.
        </p>
      </section>

      <section className="contentPanel">
        <h2>Data interpretation</h2>
        <p>
          Timing and rapid-response fields are descriptive measures. A rapid-response
          flag is a review signal rather than evidence of guessing, misconduct, or lack
          of understanding. Group trends also should not be treated as matched pre/post
          effects unless the same Study IDs contribute at both stages.
        </p>
      </section>
    </main>
  );
}
