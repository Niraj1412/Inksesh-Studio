"use client";

import { useState } from "react";

export default function ArtistsClient({ initialArtists }) {
  const [artists, setArtists] = useState(initialArtists ?? []);
  const [form, setForm] = useState({ name: "", role: "" });
  const [status, setStatus] = useState("idle");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }
    setStatus("saving");
    const response = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (data.artist) {
      setArtists((prev) => [data.artist, ...prev]);
      setForm({ name: "", role: "" });
    }
    setStatus("idle");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form
        className="flex flex-col gap-6 rounded-2xl border border-[color:var(--ink)] bg-[color:var(--paper-soft)] p-6"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
            Add artist
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl">
            Add to the team
          </h2>
        </div>
        <label className="text-sm text-[color:var(--ink-soft)]">
          Artist name
          <input
            className="mt-2 w-full rounded-2xl border border-[color:var(--ink)] bg-white px-4 py-3 text-base"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
        <label className="text-sm text-[color:var(--ink-soft)]">
          Role
          <input
            className="mt-2 w-full rounded-2xl border border-[color:var(--ink)] bg-white px-4 py-3 text-base"
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Resident artist, guest, apprentice"
          />
        </label>
        <button
          className="rounded-2xl bg-[color:var(--ink)] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[color:var(--paper)]"
          type="submit"
        >
          {status === "saving" ? "Saving..." : "Add artist"}
        </button>
      </form>

      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
            Your artists
          </p>
          <h3 className="mt-2 font-[var(--font-display)] text-2xl">
            {artists.length} artists
          </h3>
        </div>

        <div className="grid gap-4">
          {artists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--ink)] p-6 text-sm text-[color:var(--ink-soft)]">
              No artists yet. Add your first artist.
            </div>
          ) : (
            artists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--ink)] bg-white/80 px-5 py-4"
              >
                <div>
                  <p className="font-[var(--font-display)] text-xl">
                    {artist.name}
                  </p>
                  <p className="text-sm text-[color:var(--ink-soft)]">
                    {artist.role || "Artist"}
                  </p>
                </div>
                <span className="rounded-full border border-[color:var(--ink)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
                  Active
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
