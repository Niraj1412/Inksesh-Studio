import { getPublicUrl, signObjectUrl } from "@/lib/storage";

export function normalizeVariants(variants) {
  if (!variants) {
    return [];
  }

  if (Array.isArray(variants)) {
    return variants;
  }

  try {
    return JSON.parse(variants);
  } catch (error) {
    return [];
  }
}

export async function attachVariantUrls(variants) {
  const enriched = await Promise.all(
    variants.map(async (variant) => {
      const publicUrl = getPublicUrl(variant.storageKey);
      const url = publicUrl ?? (await signObjectUrl(variant.storageKey));
      return { ...variant, url };
    })
  );

  return enriched;
}
