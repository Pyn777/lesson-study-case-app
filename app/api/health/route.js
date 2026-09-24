import { NextResponse } from "next/server";
import { checkDatabase } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasInstructorKey = Boolean(process.env.INSTRUCTOR_KEY);

  if (!hasDatabaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        vercel: true,
        databaseConfigured: false,
        databaseConnected: false,
        instructorKeyConfigured: hasInstructorKey,
      },
      { status: 503 }
    );
  }

  try {
    const databaseConnected = await checkDatabase();
    return NextResponse.json({
      ok: databaseConnected,
      vercel: true,
      databaseConfigured: true,
      databaseConnected,
      instructorKeyConfigured: hasInstructorKey,
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        vercel: true,
        databaseConfigured: true,
        databaseConnected: false,
        instructorKeyConfigured: hasInstructorKey,
      },
      { status: 503 }
    );
  }
}
