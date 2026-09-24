import { NextResponse } from "next/server";
import { runPersistenceTest } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const expectedKey = process.env.INSTRUCTOR_KEY;
  const suppliedKey = request.headers.get("x-instructor-key");

  if (!expectedKey || suppliedKey !== expectedKey) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const row = await runPersistenceTest();
    return NextResponse.json({
      ok: true,
      message: "Synthetic response was written, read back, and removed successfully.",
      row,
    });
  } catch (error) {
    console.error("Persistence self-test failed:", error);
    return NextResponse.json(
      { ok: false, error: "Persistence test failed." },
      { status: 500 }
    );
  }
}
