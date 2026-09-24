import { NextResponse } from "next/server";
import { getResponses, getSummary, getSubmissionAudit, getRolePlayEntries, getUrinalysisIntegrations } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  const expectedKey = process.env.INSTRUCTOR_KEY;
  const suppliedKey = request.headers.get("x-instructor-key");

  if (!expectedKey) {
    return NextResponse.json(
      { ok: false, error: "Instructor access is not configured." },
      { status: 503 }
    );
  }

  if (suppliedKey !== expectedKey) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const [rows, summary, audit, rolePlay, urinalysis] = await Promise.all([
      getResponses(),
      getSummary(),
      getSubmissionAudit(),
      getRolePlayEntries(),
      getUrinalysisIntegrations(),
    ]);
    return NextResponse.json({ ok: true, rows, summary, audit, rolePlay, urinalysis });
  } catch (error) {
    console.error("Results fetch failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: process.env.DATABASE_URL
          ? "Unable to load results."
          : "Database is not configured yet.",
      },
      { status: 500 }
    );
  }
}
