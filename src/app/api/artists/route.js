import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { DEFAULT_STUDIO_ID } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await query(
      "select * from artists where studio_id = $1 order by created_at desc",
      [DEFAULT_STUDIO_ID]
    );

    return NextResponse.json({ artists: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load artists." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name ?? "").trim();
    const role = (body.role ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const result = await query(
      `
        insert into artists (id, studio_id, name, role)
        values ($1, $2, $3, $4)
        returning *
      `,
      [id, DEFAULT_STUDIO_ID, name, role]
    );

    return NextResponse.json({ artist: result.rows[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create artist." },
      { status: 500 }
    );
  }
}
