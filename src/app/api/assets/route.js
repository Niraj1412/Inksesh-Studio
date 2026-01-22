import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import {
  DEFAULT_STUDIO_ID,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/constants";
import { optimizeImage } from "@/lib/assets/images";
import { optimizeVideo } from "@/lib/assets/videos";
import { deleteObjects, uploadObject } from "@/lib/storage";
import { attachVariantUrls, normalizeVariants } from "@/lib/assets/variants";

export const runtime = "nodejs";


export async function GET() {
  try {
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

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("GET /api/assets failed", {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: "Failed to load assets." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileMeta = file
      ? {
          name: file.name,
          type: file.type,
          size: file.size,
        }
      : null;

    if (!file || typeof file.arrayBuffer !== "function") {
      console.error("POST /api/assets missing file", { fileMeta });
      return NextResponse.json(
        { error: "Missing file upload." },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    if (!isImage && !isVideo) {
      console.error("POST /api/assets unsupported type", {
        mimeType,
        fileMeta,
      });
      return NextResponse.json(
        { error: "Only image and video uploads are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

    if (buffer.length > maxBytes) {
      console.error("POST /api/assets file too large", {
        size: buffer.length,
        maxBytes,
        fileMeta,
      });
      return NextResponse.json(
        { error: "File is too large for the MVP limits." },
        { status: 400 }
      );
    }

    const assetId = crypto.randomUUID();
    const storagePrefix = `studio/${DEFAULT_STUDIO_ID}/assets/${assetId}`;
    const originalName = file.name || "upload";

    const processedVariants = isImage
      ? await optimizeImage(buffer)
      : [await optimizeVideo(buffer)];

    const variants = await Promise.all(
      processedVariants.map(async (variant) => {
        const filename = isImage
          ? `image-${variant.label}.${variant.extension}`
          : `video-${variant.label}.${variant.extension}`;
        const storageKey = `${storagePrefix}/${filename}`;

        try {
          await uploadObject({
            key: storageKey,
            body: variant.buffer,
            contentType: variant.contentType,
          });
        } catch (uploadError) {
          console.error("POST /api/assets upload failed", {
            storageKey,
            label: variant.label,
            contentType: variant.contentType,
            message: uploadError?.message,
            stack: uploadError?.stack,
          });
          throw uploadError;
        }

        return {
          label: variant.label,
          width: variant.width,
          height: variant.height,
          size: variant.size,
          contentType: variant.contentType,
          storageKey,
        };
      })
    );

    await query(
      `
        insert into assets (
          id,
          studio_id,
          type,
          original_filename,
          mime_type,
          storage_prefix,
          variants
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb)
      `,
      [
        assetId,
        DEFAULT_STUDIO_ID,
        isImage ? "image" : "video",
        originalName,
        mimeType,
        storagePrefix,
        JSON.stringify(variants),
      ]
    );

    const variantsWithUrls = await attachVariantUrls(variants);

    return NextResponse.json({
      asset: {
        id: assetId,
        studio_id: DEFAULT_STUDIO_ID,
        type: isImage ? "image" : "video",
        original_filename: originalName,
        mime_type: mimeType,
        storage_prefix: storagePrefix,
        variants: variantsWithUrls,
      },
    });
  } catch (error) {
    console.error("POST /api/assets failed", {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: "Upload failed. Check server logs." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("id");

    if (!assetId) {
      return NextResponse.json({ error: "Missing asset id." }, { status: 400 });
    }

    const result = await query("select * from assets where id = $1", [assetId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    const asset = result.rows[0];
    const variants = normalizeVariants(asset.variants);
    const keys = variants.map((variant) => variant.storageKey);

    await deleteObjects(keys);
    await query("delete from assets where id = $1", [assetId]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/assets failed", {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: "Failed to delete asset." },
      { status: 500 }
    );
  }
}
