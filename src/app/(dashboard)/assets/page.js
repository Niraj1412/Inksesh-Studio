import AssetsClient from "@/components/AssetsClient";
import { DEFAULT_STUDIO_ID } from "@/lib/constants";
import { query } from "@/lib/db";
import { attachVariantUrls, normalizeVariants } from "@/lib/assets/variants";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const result = await query(
    "select * from assets where studio_id = $1 order by created_at desc",
    [DEFAULT_STUDIO_ID]
  );

  const assets = await Promise.all(
    result.rows.map(async (row) => {
      const variants = normalizeVariants(row.variants);
      const variantsWithUrls = await attachVariantUrls(variants);
      return { ...row, variants: variantsWithUrls };
    })
  );

  return <AssetsClient initialAssets={assets} />;
}
