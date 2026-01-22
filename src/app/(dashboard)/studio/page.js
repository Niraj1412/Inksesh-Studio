import StudioClient from "@/components/StudioClient";
import { DEFAULT_STUDIO_ID } from "@/lib/constants";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStudio() {
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

export default async function StudioPage() {
  const studio = await getStudio();
  return <StudioClient initialStudio={studio} />;
}
