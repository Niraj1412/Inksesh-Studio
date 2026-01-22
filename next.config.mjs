/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "ffmpeg-static",
    "fluent-ffmpeg",
    "pg",
    "sharp",
  ],
};

export default nextConfig;
