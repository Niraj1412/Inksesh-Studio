import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnv = [
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const region = process.env.S3_REGION ?? "auto";
const endpoint = process.env.S3_ENDPOINT;
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

const globalForS3 = globalThis;

if (process.env.NODE_ENV !== "production") {
  console.log("[storage] config", {
    bucket: process.env.S3_BUCKET,
    region,
    endpoint,
    forcePathStyle,
    publicBaseUrl: publicBaseUrl || null,
  });
}

const s3Client =
  globalForS3.s3Client ??
  new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

if (!globalForS3.s3Client) {
  globalForS3.s3Client = s3Client;
}

export function getBucket() {
  return process.env.S3_BUCKET;
}

export function getPublicUrl(key) {
  if (!publicBaseUrl) {
    return null;
  }

  const normalized = publicBaseUrl.endsWith("/")
    ? publicBaseUrl.slice(0, -1)
    : publicBaseUrl;
  return `${normalized}/${key}`;
}

export async function uploadObject({ key, body, contentType }) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

export async function deleteObjects(keys) {
  if (!keys.length) {
    return;
  }

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: getBucket(),
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    })
  );
}

export async function signObjectUrl(key, expiresInSeconds = 3600) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
    { expiresIn: expiresInSeconds }
  );
}
