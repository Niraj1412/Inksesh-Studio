"use client";

import { useEffect, useMemo, useState } from "react";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "n/a";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
}

function getPreviewVariant(asset) {
  if (!asset?.variants?.length) return null;
  const sorted = [...asset.variants].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (
    sorted.find((variant) => variant.width === 800) ??
    sorted[sorted.length - 1]
  );
}

export default function AssetsClient({ initialAssets }) {
  const [assets, setAssets] = useState(initialAssets ?? []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    if (!previewUrl) {
      return undefined;
    }
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const refreshAssets = async () => {
    const response = await fetch("/api/assets");
    const data = await response.json();
    setAssets(data.assets ?? []);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    if (!selectedFile) {
      setError("Select an image or video to upload.");
      return;
    }
    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/assets", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Upload failed.");
      setStatus("idle");
      return;
    }

    setSelectedFile(null);
    setStatus("idle");
    await refreshAssets();
  };

  const handleDelete = async (assetId) => {
    setDeletingId(assetId);
    await fetch(`/api/assets?id=${assetId}`, { method: "DELETE" });
    await refreshAssets();
    setDeletingId(null);
  };

  const selectedMeta = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: formatBytes(selectedFile.size),
      type: selectedFile.type || "unknown",
    };
  }, [selectedFile]);

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="flex flex-col gap-6 rounded-2xl border border-[color:var(--ink)] bg-[color:var(--paper-soft)] p-6"
          onSubmit={handleUpload}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
              Media library
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl">
              Upload photos or videos
            </h2>
            <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
              Upload images or videos to build your studio portfolio.
            </p>
          </div>

          <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--ink)] bg-white/80 px-6 py-8 text-center text-sm text-[color:var(--ink-soft)]">
            <input
              className="hidden"
              type="file"
              accept="image/*,video/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
            <span className="rounded-full border border-[color:var(--ink)] px-4 py-2 text-xs uppercase tracking-[0.3em]">
              Select file
            </span>
            <span>Drop an image or video (max size applies).</span>
          </label>

          {selectedMeta && (
            <div className="rounded-2xl border border-[color:var(--ink)] bg-white/70 p-4 text-sm text-[color:var(--ink-soft)]">
              <p className="font-[var(--font-display)] text-lg text-[color:var(--ink)]">
                {selectedMeta.name}
              </p>
              <p className="mt-1">File type: {selectedMeta.type}</p>
              <p>File size: {selectedMeta.size}</p>
            </div>
          )}

          {error ? (
            <p className="text-sm text-[color:var(--copper)]">{error}</p>
          ) : null}

          <button
            className="rounded-2xl bg-[color:var(--ink)] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[color:var(--paper)]"
            type="submit"
          >
            {status === "uploading" ? "Uploading..." : "Upload"}
          </button>
        </form>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[color:var(--ink)] bg-white/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
              Preview
            </p>
            <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[color:var(--ink)] bg-[color:var(--paper)] p-4">
              {previewUrl ? (
                selectedFile?.type?.startsWith("video/") ? (
                  <video
                    className="max-h-[240px] w-full rounded-xl"
                    src={previewUrl}
                    controls
                  />
                ) : (
                  <img
                    className="max-h-[240px] w-full rounded-xl object-contain"
                    src={previewUrl}
                    alt="Selected upload preview"
                  />
                )
              ) : (
                <p className="text-sm text-[color:var(--ink-soft)]">
                  Select a file to preview.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--ink)] bg-[color:var(--paper-soft)] p-6 text-sm text-[color:var(--ink-soft)]">
            <p className="text-xs uppercase tracking-[0.3em]">Tips</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>Use high-quality images for the best portfolio results.</li>
              <li>Short clips load faster and look great on mobile.</li>
              <li>You can remove and re-upload anytime.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
              Your uploads
            </p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl">
              {assets.length} items
            </h3>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--ink)] p-6 text-sm text-[color:var(--ink-soft)]">
              No uploads yet. Add your first image or video.
            </div>
          ) : (
            assets.map((asset) => {
              const preview = getPreviewVariant(asset);
              return (
                <div
                  key={asset.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[color:var(--ink)] bg-white/80 p-5"
                >
                  <div className="rounded-2xl border border-dashed border-[color:var(--ink)] bg-[color:var(--paper)] p-3">
                    {asset.type === "video" ? (
                      <video
                        className="max-h-[220px] w-full rounded-xl"
                        src={preview?.url}
                        controls
                      />
                    ) : (
                      <img
                        className="max-h-[220px] w-full rounded-xl object-contain"
                        src={preview?.url}
                        alt={asset.original_filename || "Asset preview"}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-[color:var(--ink-soft)]">
                    <p className="font-[var(--font-display)] text-lg text-[color:var(--ink)]">
                      {asset.original_filename || "Untitled upload"}
                    </p>
                    <p>
                      File type:{" "}
                      <span className="font-mono text-[color:var(--ink)]">
                        {asset.type}
                      </span>
                    </p>
                  </div>
                  <button
                    className="rounded-2xl border border-[color:var(--ink)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    disabled={deletingId === asset.id}
                  >
                    {deletingId === asset.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
