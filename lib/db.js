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
      submission_id TEXT,
      session_id TEXT,
      attempt_type TEXT,
      client_attempt INTEGER,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      course TEXT,
      section TEXT,
      semester TEXT,
      cohort TEXT,
      instructor TEXT,
      delivery_mode TEXT,
      module TEXT NOT NULL,
      question_id TEXT NOT NULL,
      concept_tag TEXT,
      anchor_id TEXT,
      construct TEXT,
      cognitive_level TEXT,
      item_role TEXT,
      discipline TEXT,
      transfer_type TEXT,
      choice_index INTEGER NOT NULL,
      correct BOOLEAN NOT NULL,
      attempt INTEGER NOT NULL DEFAULT 1,
      response_ms INTEGER,
      first_answer_ms INTEGER,
      decision_ms INTEGER,
      module_elapsed_ms INTEGER,
      answer_changes INTEGER NOT NULL DEFAULT 0,
      rapid_response_flag BOOLEAN NOT NULL DEFAULT FALSE,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS submission_id TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS session_id TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS attempt_type TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS client_attempt INTEGER
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS semester TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS cohort TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS instructor TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS delivery_mode TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS concept_tag TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS anchor_id TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS construct TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS cognitive_level TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS item_role TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS discipline TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS transfer_type TEXT
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS first_answer_ms INTEGER
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS decision_ms INTEGER
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS module_elapsed_ms INTEGER
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS answer_changes INTEGER NOT NULL DEFAULT 0
  `;
  await sql`
    ALTER TABLE lesson_study_responses
    ADD COLUMN IF NOT EXISTS rapid_response_flag BOOLEAN NOT NULL DEFAULT FALSE
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_lesson_study_study_id
    ON lesson_study_responses (study_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_lesson_study_module
    ON lesson_study_responses (module)
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_study_submission_question_unique
    ON lesson_study_responses (submission_id, question_id)
    WHERE submission_id IS NOT NULL
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lesson_study_submission_audit (
      submission_id TEXT PRIMARY KEY,
      session_id TEXT,
      study_id TEXT,
      module TEXT NOT NULL,
      semester TEXT,
      client_attempt INTEGER,
      canonical_attempt INTEGER,
      attempt_type TEXT,
      row_count INTEGER NOT NULL,
      status TEXT NOT NULL,
      submitted_at TIMESTAMPTZ,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_lesson_study_audit_study_module
    ON lesson_study_submission_audit (study_id, module)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lesson_study_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      active_modules JSONB NOT NULL DEFAULT '["cellular-foundation","microbiology","renal-response","integrated-assessment"]'::jsonb,
      active_anchor_question_ids JSONB NOT NULL DEFAULT '["cell-3","micro-2","renal-3","integrated-1"]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO lesson_study_settings (id)
    VALUES (1)
    ON CONFLICT (id) DO NOTHING
  `;
  return sql;
}

export async function insertResponses(rows) {
  const sql = await ensureSchema();
  if (!rows?.length) return { inserted: [], duplicate: false, canonicalAttempt: 1 };

  const first = rows[0] || {};
  const submissionId = String(first.submissionId || "").trim();
  const sessionId = String(first.sessionId || "").trim() || null;
  const studyId = String(first.studyId || "").trim() || null;
  const module = String(first.module || "unknown");
  const semester = String(first.semester || "").trim() || null;
  const clientAttempt = Math.max(1, Number(first.attempt || 1));

  if (!submissionId) {
    throw new Error("submissionId is required");
  }

  return sql.begin(async (tx) => {
    const [existingAudit] = await tx`
      SELECT canonical_attempt AS "canonicalAttempt", status
      FROM lesson_study_submission_audit
      WHERE submission_id = ${submissionId}
    `;

    if (existingAudit) {
      return {
        inserted: [],
        duplicate: true,
        canonicalAttempt: Number(existingAudit.canonicalAttempt || clientAttempt),
      };
    }

    const [attemptRow] = await tx`
      SELECT COALESCE(MAX(canonical_attempt), 0)::int AS "maxAttempt"
      FROM lesson_study_submission_audit
      WHERE module = ${module}
        AND COALESCE(study_id, '') = COALESCE(${studyId}, '')
        AND COALESCE(semester, '') = COALESCE(${semester}, '')
        AND status = 'accepted'
    `;

    const canonicalAttempt = Number(attemptRow?.maxAttempt || 0) + 1;
    const attemptType = canonicalAttempt > 1 ? "retake" : "initial";

    const normalized = rows.map((row) => ({
      study_id: row.studyId || null,
      submission_id: submissionId,
      session_id: row.sessionId || sessionId,
      attempt_type: attemptType,
      client_attempt: Number(row.attempt || clientAttempt),
      course: row.course || null,
      section: row.section || null,
      semester: row.semester || null,
      cohort: row.cohort || null,
      instructor: row.instructor || null,
      delivery_mode: row.deliveryMode || null,
      module: String(row.module || "unknown"),
      question_id: String(row.questionId || ""),
      concept_tag: row.conceptTag || null,
      anchor_id: row.anchorId || null,
      construct: row.construct || null,
      cognitive_level: row.cognitiveLevel || null,
      item_role: row.itemRole || null,
      discipline: row.discipline || null,
      transfer_type: row.transferType || null,
      choice_index: Number(row.choiceIndex),
      correct: Boolean(row.correct),
      attempt: canonicalAttempt,
      response_ms: Number.isFinite(Number(row.responseMs))
        ? Math.max(0, Math.round(Number(row.responseMs)))
        : null,
      first_answer_ms: Number.isFinite(Number(row.firstAnswerMs))
        ? Math.max(0, Math.round(Number(row.firstAnswerMs)))
        : null,
      decision_ms: Number.isFinite(Number(row.decisionMs))
        ? Math.max(0, Math.round(Number(row.decisionMs)))
        : null,
      module_elapsed_ms: Number.isFinite(Number(row.moduleElapsedMs))
        ? Math.max(0, Math.round(Number(row.moduleElapsedMs)))
        : null,
      answer_changes: Number.isFinite(Number(row.answerChanges))
        ? Math.max(0, Math.round(Number(row.answerChanges)))
        : 0,
      rapid_response_flag: Boolean(row.rapidResponseFlag),
      submitted_at: row.submittedAt ? new Date(row.submittedAt) : new Date(),
    }));

    await tx`
      INSERT INTO lesson_study_submission_audit (
        submission_id, session_id, study_id, module, semester,
        client_attempt, canonical_attempt, attempt_type, row_count,
        status, submitted_at
      )
      VALUES (
        ${submissionId}, ${sessionId}, ${studyId}, ${module}, ${semester},
        ${clientAttempt}, ${canonicalAttempt}, ${attemptType}, ${normalized.length},
        'accepted', ${first.submittedAt ? new Date(first.submittedAt) : new Date()}
      )
    `;

    const inserted = await tx`
      INSERT INTO lesson_study_responses
        ${tx(normalized)}
      ON CONFLICT (submission_id, question_id)
        WHERE submission_id IS NOT NULL
      DO NOTHING
      RETURNING id
    `;

    return { inserted, duplicate: false, canonicalAttempt, attemptType };
  });
}

export async function getResponses() {
  const sql = await ensureSchema();
  return sql`
    SELECT
      id,
      study_id AS "studyId",
      submission_id AS "submissionId",
      session_id AS "sessionId",
      attempt_type AS "attemptType",
      client_attempt AS "clientAttempt",
      received_at AS "receivedAt",
      course,
      section,
      semester,
      cohort,
      instructor,
      delivery_mode AS "deliveryMode",
      module,
      question_id AS "questionId",
      concept_tag AS "conceptTag",
      anchor_id AS "anchorId",
      construct,
      cognitive_level AS "cognitiveLevel",
      item_role AS "itemRole",
      discipline,
      transfer_type AS "transferType",
      choice_index AS "choiceIndex",
      correct,
      attempt,
      response_ms AS "responseMs",
      first_answer_ms AS "firstAnswerMs",
      decision_ms AS "decisionMs",
      module_elapsed_ms AS "moduleElapsedMs",
      answer_changes AS "answerChanges",
      rapid_response_flag AS "rapidResponseFlag",
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


export async function runPersistenceTest() {
  const sql = await ensureSchema();
  const marker = "__SYSTEM_TEST__";
  const submittedAt = new Date();

  const [inserted] = await sql`
    INSERT INTO lesson_study_responses (
      study_id, course, section, module, question_id,
      choice_index, correct, attempt, response_ms, submitted_at
    )
    VALUES (
      ${marker}, 'System Test', 'Diagnostic', 'system-test', '__health__',
      0, true, 1, 1, ${submittedAt}
    )
    RETURNING id, study_id AS "studyId", module, question_id AS "questionId",
              correct, submitted_at AS "submittedAt"
  `;

  const [verified] = await sql`
    SELECT id, study_id AS "studyId", module, question_id AS "questionId",
           correct, submitted_at AS "submittedAt"
    FROM lesson_study_responses
    WHERE id = ${inserted.id}
  `;

  await sql`
    DELETE FROM lesson_study_responses
    WHERE id = ${inserted.id}
  `;

  return verified;
}


const DEFAULT_STUDY_SETTINGS = {
  activeModules: [
    "cellular-foundation",
    "microbiology",
    "renal-response",
    "integrated-assessment",
  ],
  activeAnchorQuestionIds: ["cell-3", "micro-2", "renal-3", "integrated-1"],
};

export async function getStudySettings() {
  const sql = await ensureSchema();
  const [row] = await sql`
    SELECT
      active_modules AS "activeModules",
      active_anchor_question_ids AS "activeAnchorQuestionIds",
      updated_at AS "updatedAt"
    FROM lesson_study_settings
    WHERE id = 1
  `;

  return {
    activeModules: Array.isArray(row?.activeModules)
      ? row.activeModules
      : DEFAULT_STUDY_SETTINGS.activeModules,
    activeAnchorQuestionIds: Array.isArray(row?.activeAnchorQuestionIds)
      ? row.activeAnchorQuestionIds
      : DEFAULT_STUDY_SETTINGS.activeAnchorQuestionIds,
    updatedAt: row?.updatedAt || null,
  };
}

export async function saveStudySettings(settings) {
  const sql = await ensureSchema();
  const activeModules = Array.isArray(settings?.activeModules)
    ? [...new Set(settings.activeModules.map(String))]
    : DEFAULT_STUDY_SETTINGS.activeModules;
  const activeAnchorQuestionIds = Array.isArray(settings?.activeAnchorQuestionIds)
    ? [...new Set(settings.activeAnchorQuestionIds.map(String))]
    : DEFAULT_STUDY_SETTINGS.activeAnchorQuestionIds;

  const [row] = await sql`
    UPDATE lesson_study_settings
    SET
      active_modules = ${sql.json(activeModules)},
      active_anchor_question_ids = ${sql.json(activeAnchorQuestionIds)},
      updated_at = NOW()
    WHERE id = 1
    RETURNING
      active_modules AS "activeModules",
      active_anchor_question_ids AS "activeAnchorQuestionIds",
      updated_at AS "updatedAt"
  `;

  return row;
}


export async function getSubmissionAudit() {
  const sql = await ensureSchema();
  return sql`
    SELECT
      submission_id AS "submissionId",
      session_id AS "sessionId",
      study_id AS "studyId",
      module,
      semester,
      client_attempt AS "clientAttempt",
      canonical_attempt AS "canonicalAttempt",
      attempt_type AS "attemptType",
      row_count AS "rowCount",
      status,
      submitted_at AS "submittedAt",
      received_at AS "receivedAt"
    FROM lesson_study_submission_audit
    ORDER BY received_at DESC
    LIMIT 2000
  `;
}
