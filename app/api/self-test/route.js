import { NextResponse } from "next/server";
import { runPersistenceTest } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const row = await runPersistenceTest();
    return NextResponse.json({
      ok: true,
      message: "Synthetic response write/read/delete succeeded.",
      row,
    });
  } catch (error) {
    console.error("Temporary persistence test failed:", error);
    return NextResponse.json(
      { ok: false, error: "Persistence test failed." },
      { status: 500 }
    );
  }
}
