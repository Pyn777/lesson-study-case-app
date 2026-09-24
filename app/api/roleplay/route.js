import { NextResponse } from "next/server";
import { insertRolePlay } from "../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !body?.roleplayId ||
      !body?.module ||
      !body?.roleName ||
      !body?.claimText ||
      !body?.evidenceText ||
      !body?.actionText
    ) {
      return NextResponse.json(
        { ok: false, error: "Incomplete role-play handoff." },
        { status: 400 }
      );
    }

    const result = await insertRolePlay(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Role-play save failed:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save role-play handoff." },
      { status: 500 }
    );
  }
}
