import postgres from "postgres";

let client;

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!client) {
    client = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      max: 5,
      idle_timeout: 20,
    });
  }
  return client;
}

export async function ensureSchema() {
  const sql = getClient();
  await sql`
    CREATE TABLE IF NOT EXISTS lesson_study_responses (
      id BIGSERIAL PRIMARY KEY,
      study_id TEXT,
      course TEXT,
      section TEXT,
      module TEXT NOT NULL,
      question_id TEXT NOT NULL,
      choice_index INTEGER NOT NULL,
      correct BOOLEAN NOT NULL,
      attempt INTEGER NOT NULL DEFAULT 1,
      response_ms INTEGER,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_lesson_study_study_id
    ON lesson_study_responses (study_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_lesson_study_module
    ON lesson_study_responses (module)
  `;
  return sql;
}

export async function insertResponses(rows) {
  const sql = await ensureSchema();
  if (!rows?.length) return [];

  const normalized = rows.map((row) => ({
    study_id: row.studyId || null,
    course: row.course || null,
    section: row.section || null,
    module: String(row.module || "unknown"),
    question_id: String(row.questionId || ""),
    choice_index: Number(row.choiceIndex),
    correct: Boolean(row.correct),
    attempt: Number(row.attempt || 1),
    response_ms: Number.isFinite(Number(row.responseMs))
      ? Math.max(0, Math.round(Number(row.responseMs)))
      : null,
    submitted_at: row.submittedAt ? new Date(row.submittedAt) : new Date(),
  }));

  return sql`
    INSERT INTO lesson_study_responses
      ${sql(normalized)}
    RETURNING id
  `;
}

export async function getResponses() {
  const sql = await ensureSchema();
  return sql`
    SELECT
      id,
      study_id AS "studyId",
      course,
      section,
      module,
      question_id AS "questionId",
      choice_index AS "choiceIndex",
      correct,
      attempt,
      response_ms AS "responseMs",
      submitted_at AS "submittedAt"
    FROM lesson_study_responses
    ORDER BY submitted_at DESC, id DESC
    LIMIT 5000
  `;
}

export async function getSummary() {
  const sql = await ensureSchema();
  const [summary] = await sql`
    SELECT
      COUNT(*)::int AS "totalResponses",
      COALESCE(SUM(CASE WHEN correct THEN 1 ELSE 0 END), 0)::int AS "correctResponses",
      COALESCE(AVG(response_ms), 0)::float AS "avgResponseMs",
      COUNT(DISTINCT NULLIF(study_id, ''))::int AS "uniqueStudyIds"
    FROM lesson_study_responses
  `;
  return summary;
}


export async function checkDatabase() {
  const sql = getClient();
  const [row] = await sql`SELECT 1 AS ok`;
  return row?.ok === 1;
}
