const modules = [
  {
    id: 'genbio',
    title: 'General Biology / A&P I',
    subtitle: 'Cellular Foundation',
    items: [
      'Membrane transport, diffusion, and osmosis',
      'Water and solute movement',
      'Foundation for understanding fluid shifts'
    ]
  },
  {
    id: 'micro',
    title: 'Microbiology',
    subtitle: 'Infectious-Disease Lens',
    items: [
      'Identify likely pathogen or bacterial culture',
      'Use microbiology evidence to interpret illness',
      'Connect infection to fluid loss and dehydration'
    ]
  },
  {
    id: 'ap2',
    title: 'A&P II',
    subtitle: 'Systems Perspective',
    items: [
      'Nephron physiology and kidney function',
      'Fluid and electrolyte balance',
      'Blood pressure, homeostasis, and compensation'
    ]
  }
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Lesson Study Prototype</div>
        <h1>Interdisciplinary Case Study App</h1>
        <p className="lead">One longitudinal case, revisited through multiple disciplinary lenses.</p>
      </section>

      <section className="caseCard">
        <div>
          <span className="pill">Shared case</span>
          <h2>Summer Camp Gastrointestinal Outbreak</h2>
          <p>Several campers develop vomiting, diarrhea, dehydration, and possible electrolyte disturbances.</p>
        </div>
        <div className="caseMeta">
          <strong>Different lenses, one common problem.</strong>
          <span>Introduce early, revisit across courses, deepen understanding.</span>
        </div>
      </section>

      <section className="grid">
        {modules.map((module, index) => (
          <article key={module.id} className={`module module-${index + 1}`}>
            <div className="moduleNumber">{index + 1}</div>
            <h3>{module.title}</h3>
            <p className="subtitle">{module.subtitle}</p>
            <ul>
              {module.items.map(item => <li key={item}>{item}</li>)}
            </ul>
            <button disabled>Open module</button>
          </article>
        ))}
      </section>

      <section className="shared">
        <h2>Shared Elements Across Courses</h2>
        <div className="sharedGrid">
          <div><strong>Shared assessment items</strong><span>Common or equivalent questions across modules.</span></div>
          <div><strong>Aligned learning outcomes</strong><span>Each course keeps its own disciplinary objective.</span></div>
          <div><strong>Longitudinal data</strong><span>Track accuracy, attempts, and response time over time.</span></div>
          <div><strong>Communication / role play</strong><span>Students interpret the case from different professional perspectives.</span></div>
        </div>
      </section>

      <section className="next">
        <h2>MVP roadmap</h2>
        <ol>
          <li>Build the shared camper case and three course modules.</li>
          <li>Add shared assessment questions and module-specific questions.</li>
          <li>Store responses in a database with course, semester, correctness, and response time.</li>
          <li>Add an instructor dashboard after the student flow is working.</li>
        </ol>
      </section>
    </main>
  );
}
