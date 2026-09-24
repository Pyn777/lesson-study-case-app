import { NextResponse } from "next/server";
import { insertResponses } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];

    if (!rows.length) {
      return NextResponse.json(
        { ok: false, error: "No response rows supplied." },
        { status: 400 }
      );
    }

    for (const row of rows) {
      if (
        !row.module ||
        !row.questionId ||
        !Number.isInteger(Number(row.choiceIndex))
      ) {
        return NextResponse.json(
          { ok: false, error: "Invalid response data." },
          { status: 400 }
        );
      }
    }

    const inserted = await insertResponses(rows);
    return NextResponse.json({ ok: true, inserted: inserted.length });
  } catch (error) {
    console.error("Response insert failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: process.env.DATABASE_URL
          ? "Unable to save responses."
          : "Database is not configured yet.",
      },
      { status: 500 }
    );
  }
}
