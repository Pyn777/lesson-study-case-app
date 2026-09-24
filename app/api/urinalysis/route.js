import { NextResponse } from "next/server";
import { insertUrinalysisIntegration } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body?.integrationId || !body?.caseId) {
      return NextResponse.json(
        { ok: false, error: "Incomplete urinalysis integration data." },
        { status: 400 }
      );
    }

    const result = await insertUrinalysisIntegration(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Urinalysis integration save failed:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save urinalysis integration data." },
      { status: 500 }
    );
  }
}
