import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEFAULT_STUDIO_ID } from "@/lib/constants";

export const runtime = "nodejs";

async function getOrCreateStudio() {
  const existing = await query("select * from studios where id = $1", [
    DEFAULT_STUDIO_ID,
  ]);

  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const created = await query(
    "insert into studios (id, name, area, specialties) values ($1, $2, $3, $4) returning *",
    [DEFAULT_STUDIO_ID, "Inksesh Studio", "Austin, TX", "Fine line, Color"]
  );

  return created.rows[0];
}

export async function GET() {
  try {
    const studio = await getOrCreateStudio();
    return NextResponse.json({ studio });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load studio." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name ?? "").trim() || "Inksesh Studio";
    const area = (body.area ?? "").trim();
    const specialties = (body.specialties ?? "").trim();

    const result = await query(
      `
        insert into studios (id, name, area, specialties)
        values ($1, $2, $3, $4)
        on conflict (id) do update
        set name = excluded.name,
            area = excluded.area,
            specialties = excluded.specialties
        returning *
      `,
      [DEFAULT_STUDIO_ID, name, area, specialties]
    );

    return NextResponse.json({ studio: result.rows[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update studio." },
      { status: 500 }
    );
  }
}
