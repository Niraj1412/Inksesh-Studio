import ArtistsClient from "@/components/ArtistsClient";
import { DEFAULT_STUDIO_ID } from "@/lib/constants";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const result = await query(
    "select * from artists where studio_id = $1 order by created_at desc",
    [DEFAULT_STUDIO_ID]
  );

  return <ArtistsClient initialArtists={result.rows} />;
}
