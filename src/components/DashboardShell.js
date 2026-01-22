"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const navItems = [
  {
    href: "/studio",
    label: "Studio",
    description: "Location and specialties.",
  },
  {
    href: "/artists",
    label: "Artists",
    description: "Your artist team.",
  },
  {
    href: "/assets",
    label: "Assets",
    description: "Upload and manage photos and videos.",
  },
];

function NavCard({ href, label, description, active }) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-[color:var(--ink)] p-5 transition ${
        active
          ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
          : "bg-white/70 text-[color:var(--ink)] hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-2xl">{label}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
            active
              ? "border-[color:var(--paper)] text-[color:var(--paper)]"
              : "border-[color:var(--ink)] text-[color:var(--ink-soft)]"
          }`}
        >
          {active ? "Active" : "Open"}
        </span>
      </div>
      <p
        className={`mt-3 text-sm ${
          active ? "text-[color:var(--paper-soft)]" : "text-[color:var(--ink-soft)]"
        }`}
      >
        {description}
      </p>
    </Link>
  );
}

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const authed = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem("studio_admin_auth") === "true",
    () => false
  );
  const phone = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => localStorage.getItem("studio_admin_phone") || "",
    () => ""
  );

  const handleLogout = () => {
    localStorage.removeItem("studio_admin_auth");
    localStorage.removeItem("studio_admin_phone");
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
          Session expired
        </p>
        <h2 className="font-[var(--font-display)] text-3xl">
          Return to login
        </h2>
        <Link
          href="/"
          className="rounded-full border border-[color:var(--ink)] px-5 py-2 text-xs uppercase tracking-[0.2em]"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 sm:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 animate-[fade-up_0.6s_ease-out]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
              Studio Dashboard
            </p>
            <h1 className="mt-2 font-[var(--font-display)] text-4xl">
              Inksesh Studio
            </h1>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
              Signed in {phone ? `as ${phone}` : "for the studio account"}.
            </p>
          </div>
          <button
            className="rounded-full border border-[color:var(--ink)] px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <nav
          className="grid gap-4 md:grid-cols-3 animate-[fade-up_0.6s_ease-out]"
          style={{ animationDelay: "120ms" }}
        >
          {navItems.map((item) => (
            <NavCard
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <main
          className="rounded-3xl border border-[color:var(--ink)] bg-white/80 p-6 shadow-[0_25px_80px_rgba(20,17,15,0.1)] backdrop-blur animate-[glow-in_0.6s_ease-out]"
          style={{ animationDelay: "200ms" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
