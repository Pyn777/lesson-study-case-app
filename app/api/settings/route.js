import { NextResponse } from "next/server";
import { getStudySettings, saveStudySettings } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getStudySettings();
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Unable to load study settings:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to load study settings." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const expectedKey = process.env.INSTRUCTOR_KEY;
  const suppliedKey = request.headers.get("x-instructor-key");

  if (!expectedKey || suppliedKey !== expectedKey) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await saveStudySettings(body);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Unable to save study settings:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save study settings." },
      { status: 500 }
    );
  }
}
