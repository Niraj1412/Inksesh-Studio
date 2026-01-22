"use client";

import { useState } from "react";

export default function StudioClient({ initialStudio }) {
  const [studio, setStudio] = useState(initialStudio);
  const [form, setForm] = useState({
    name: initialStudio?.name ?? "",
    area: initialStudio?.area ?? "",
    specialties: initialStudio?.specialties ?? "",
  });
  const [status, setStatus] = useState("idle");
  const statusLabel =
    status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Ready";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("saving");
    const response = await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setStudio(data.studio);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="flex flex-col gap-6 rounded-2xl border border-[color:var(--ink)] bg-white/70 p-6"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
            Studio profile
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl">
            Studio details
          </h2>
        </div>

        <label className="text-sm text-[color:var(--ink-soft)]">
          Studio name
          <input
            className="mt-2 w-full rounded-2xl border border-[color:var(--ink)] bg-white px-4 py-3 text-base"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
        <label className="text-sm text-[color:var(--ink-soft)]">
          Area / location
          <input
            className="mt-2 w-full rounded-2xl border border-[color:var(--ink)] bg-white px-4 py-3 text-base"
            name="area"
            value={form.area}
            onChange={handleChange}
          />
        </label>
        <label className="text-sm text-[color:var(--ink-soft)]">
          Specialties
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-[color:var(--ink)] bg-white px-4 py-3 text-base"
            name="specialties"
            value={form.specialties}
            onChange={handleChange}
            placeholder="Fine line, blackout, color realism"
          />
        </label>
        <button
          className="rounded-2xl bg-[color:var(--ink)] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[color:var(--paper)]"
          type="submit"
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-[color:var(--ink)] bg-[color:var(--paper-soft)] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
            Preview
          </p>
          <h3 className="mt-3 font-[var(--font-display)] text-2xl">
            {studio?.name ?? "Loading studio..."}
          </h3>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            {studio?.area || "Set a location to help artists find the studio."}
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--ink)] bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
            Specialties
          </p>
          <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
            {studio?.specialties
              ? studio.specialties
              : "Add a short description of your style."}
          </p>
          <div className="mt-4 text-xs text-[color:var(--ink-soft)]">
            Status:{" "}
            <span className="font-mono text-[color:var(--ink)]">
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
