# Studio Admin App (Inksesh MVP)

A deployable MVP for a tattoo studio admin to manage studio info, artists, and a full asset pipeline (upload -> optimize -> store -> serve).

## Overview

- Auth: Mocked phone OTP for a single studio admin (client-only; the code is shown on screen).
- Studio: Single studio profile (name, area, specialties) stored under `studio-default`.
- Artists: Create and list the roster.
- Assets: Upload images or videos, generate optimized variants, preview/list, and delete.
- Storage: S3-compatible uploads with public or signed URLs.

## Tech Stack

- Frontend: Next.js App Router, React 19, Tailwind CSS 4
- Backend: Next.js route handlers (Node runtime)
- Database: Postgres (Supabase/Neon/etc.) via `pg`
- Storage: S3-compatible (AWS S3, Cloudflare R2, MinIO)
- Image optimization: `sharp` -> WebP
- Video optimization: `ffmpeg` via `ffmpeg-static`

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a `.env.local` with the following:

```bash
# Database (required)
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB

# Optional database SSL toggles
DATABASE_SSL=true
PGSSLMODE=require

# S3-compatible storage (required for /api/assets)
S3_BUCKET=ink-admin-assets
S3_REGION=auto
S3_ENDPOINT=https://<your-r2-or-s3-endpoint>
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Public base URL for serving assets (recommended)
S3_PUBLIC_BASE_URL=https://<public-bucket-domain>

# Optional
S3_FORCE_PATH_STYLE=false
```

Notes:
- `S3_PUBLIC_BASE_URL` omitted -> API returns signed URLs (1 hour expiry).
- `S3_ENDPOINT` is required for R2/MinIO; AWS S3 can omit it.
- Set `DATABASE_SSL=false` or `PGSSLMODE=disable` for local Postgres.

## Asset Pipeline (Most Important)

### Upload Flow

1. Frontend uses `FormData` (multipart) to POST `/api/assets`.
2. Backend validates MIME type (image/* or video/*) and size limits (10 MB image, 100 MB video).
3. The pipeline branches by media type (image/video).

### Optimization

Images (`src/lib/assets/images.js`)

- Auto-rotate using EXIF.
- Resize to 400, 800, 1600 widths (no upscaling).
- Convert to WebP at quality 82.

Videos (`src/lib/assets/videos.js`)

- Transcode to MP4 (H.264 + AAC).
- Faststart enabled for streaming.
- Compression pass (`crf=28`, `preset=veryfast`).

### Storage

S3-compatible storage with structured paths:

```
studio/{studioId}/assets/{assetId}/image-w800.webp
studio/{studioId}/assets/{assetId}/video-mp4.mp4
```

Stored metadata (Postgres `assets` table):

- `type`: `image` or `video`
- `original_filename`
- `mime_type`
- `storage_prefix`
- `variants` (JSONB: label, dimensions, size, storage key)
- `created_at`

### Serving

- Each variant includes a `url` assembled from `S3_PUBLIC_BASE_URL` or a signed URL.
- CDN-friendly cache headers set on uploads.

### Deletion

- `DELETE /api/assets?id=<assetId>` removes S3 objects and the DB row.

## Project Structure

```
src/
  app/
    api/
      assets/route.js
      artists/route.js
      studio/route.js
    (dashboard)/
      assets/page.js
      artists/page.js
      studio/page.js
    layout.js
    page.js
  components/
    AssetsClient.js
    ArtistsClient.js
    DashboardShell.js
    StudioClient.js
  lib/
    assets/
      images.js
      videos.js
      variants.js
    constants.js
    db.js
    storage.js
```

## Deployment (Example: Vercel + Supabase + R2)

1. Create a Postgres database and grab `DATABASE_URL`.
2. Create an S3-compatible bucket (R2, AWS S3, or MinIO).
3. Set bucket access to public or provide a public URL.
4. Deploy to Vercel with the environment variables above.
5. Ensure the Vercel deployment uses the Node.js runtime (default for route handlers).

## Tradeoffs & Shortcuts

- Auth is mocked (phone OTP) and stored in localStorage; API routes have no server-side auth.
- Single studio id (`studio-default`) for the MVP, no multi-tenant support yet.
- Schema auto-creates on first DB query (no migrations).
- File uploads use `request.formData()` (buffers in memory).
- Video pipeline is a single-pass compression (good enough for MVP).
- No background jobs or queue; optimization happens inline on upload.

## Why Early-Stage?

I enjoy environments where problems are real, constraints are tight, and decisions actually matter. Early-stage startups force you to think end-to-end: product, engineering, UX, and tradeoffs, not just isolated tasks. I like owning outcomes, shipping fast, and improving systems based on real usage rather than assumptions or long planning cycles.

## Craziest Thing Built Solo

One of the craziest things I have built single-handedly is ClipSmart AI, an AI-driven video platform that lets users search long videos and extract precise clips using natural-language commands. I designed and built the entire system end-to-end: frontend, backend, AI pipelines, video processing, storage, and deployment. The hardest part was not the AI itself, but making the system reliable under latency, cost, and ambiguity while shipping something real users could actually use.

## Why Inksesh?

I want to join InkSesh because it is an early-stage product solving a real, non-trivial problem with clear long-term impact. From a career perspective, it offers the chance to work end-to-end on meaningful systems, media pipelines, discovery, and trust, while learning directly from real user behavior. It is the kind of environment where strong engineering judgment, ownership, and growth actually matter.

## What I'd Improve With 2 More Weeks

- Add background processing and progress tracking for large uploads.
- Improve asset versioning and metadata (tags, usage context, artist association).
- Add more aggressive video optimization and adaptive formats.
- Harden error handling, retries, and observability for the asset pipeline.
- Polish the UI around asset previews and filtering based on real usage patterns.
- Make the asset system feel production-ready under real studio workloads.

## Demo Video Guidance

- Walk through login (mocked OTP).
- Update studio info and add an artist.
- Upload an image and a video, then show optimized variants in the asset list.
- Delete an asset to show cleanup.
- Show the S3 bucket paths and explain optimization choices.
- Cover deployment variables and tradeoffs.
