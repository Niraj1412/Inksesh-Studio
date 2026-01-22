import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import crypto from "crypto";

if (!ffmpegPath) {
  throw new Error("ffmpeg binary not available. Install ffmpeg-static.");
}

ffmpeg.setFfmpegPath(ffmpegPath);

function createTempPath(suffix) {
  return join(tmpdir(), `ink-asset-${crypto.randomUUID()}${suffix}`);
}

export async function optimizeVideo(buffer) {
  const inputPath = createTempPath(".input");
  const outputPath = createTempPath(".mp4");

  await fs.writeFile(inputPath, buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-preset veryfast",
        "-crf 28",
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart",
      ])
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });

  const outputBuffer = await fs.readFile(outputPath);

  await Promise.allSettled([
    fs.unlink(inputPath),
    fs.unlink(outputPath),
  ]);

  return {
    label: "mp4",
    width: null,
    height: null,
    size: outputBuffer.length,
    contentType: "video/mp4",
    extension: "mp4",
    buffer: outputBuffer,
  };
}
