import sharp from "sharp";
import { IMAGE_WIDTHS } from "../constants";

export async function optimizeImage(buffer) {
  const base = sharp(buffer, { failOn: "none" }).rotate();
  const variants = [];

  for (const width of IMAGE_WIDTHS) {
    const { data, info } = await base
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    variants.push({
      label: `w${info.width}`,
      width: info.width,
      height: info.height,
      size: data.length,
      contentType: "image/webp",
      extension: "webp",
      buffer: data,
    });
  }

  return variants;
}
