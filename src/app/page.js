"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function generateMockCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mockCode, setMockCode] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const authed = localStorage.getItem("studio_admin_auth") === "true";
    if (authed) {
      router.replace("/studio");
    }
  }, [router]);

  const handleSend = (event) => {
    event.preventDefault();
    if (!phone.trim()) {
      return;
    }
    setMockCode(generateMockCode());
    setStep("otp");
  };

  const handleVerify = (event) => {
    event.preventDefault();
    if (!otp.trim()) {
      return;
    }
    localStorage.setItem("studio_admin_auth", "true");
    localStorage.setItem("studio_admin_phone", phone.trim());
    router.push("/studio");
  };

  return (
    <div className="min-h-screen px-6 py-10 sm:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[color:var(--ink)] bg-[color:var(--paper-soft)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
                Studio Portal
              </p>
              <h1 className="font-[var(--font-display)] text-2xl">
                Inksesh Atelier
              </h1>
            </div>
          </div>
          <span className="rounded-full border border-[color:var(--ink)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
            Studio Login
          </span>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[color:var(--ink)] bg-white/70 p-8 shadow-[0_20px_60px_rgba(20,17,15,0.12)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--ink-soft)]">
              Welcome Back
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl leading-tight">
              Keep your studio details, artists, and portfolio in one place.
            </h2>
            <p className="mt-6 text-base text-[color:var(--ink-soft)]">
              This demo uses a simple login code. Enter any phone number and use
              the code shown on the next step to continue.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 text-sm">
              <div className="rounded-full border border-[color:var(--ink)] px-4 py-2">
                Photo and video uploads
              </div>
              <div className="rounded-full border border-[color:var(--ink)] px-4 py-2">
                Portfolio ready
              </div>
              <div className="rounded-full border border-[color:var(--ink)] px-4 py-2">
                Artist roster
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--ink)] bg-[color:var(--paper-soft)] p-8">
            {step === "phone" ? (
              <form className="flex flex-col gap-6" onSubmit={handleSend}>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
                    Sign in
                  </p>
                  <h3 className="mt-2 font-[var(--font-display)] text-3xl">
                    Studio access
                  </h3>
                </div>
                <label className="text-sm text-[color:var(--ink-soft)]">
                  Phone number
                  <input
                    className="mt-2 w-full rounded-2xl border border-[color:var(--ink)] bg-white/80 px-4 py-3 text-base"
                    placeholder="+1 (555) 013-1010"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                <button
                  className="rounded-2xl bg-[color:var(--ink)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-[color:var(--paper)]"
                  type="submit"
                >
                  Send code
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={handleVerify}>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
                    One-time code
                  </p>
                  <h3 className="mt-2 font-[var(--font-display)] text-3xl">
                    Enter the code
                  </h3>
                  <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
                    Use code{" "}
                    <span className="rounded-full border border-[color:var(--ink)] px-3 py-1 font-mono text-[color:var(--ink)]">
                      {mockCode}
                    </span>{" "}
                    to continue.
                  </p>
                </div>
                <label className="text-sm text-[color:var(--ink-soft)]">
                  OTP code
                  <input
                    className="mt-2 w-full rounded-2xl border border-[color:var(--ink)] bg-white/80 px-4 py-3 text-base"
                    placeholder="123456"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                  />
                </label>
                <button
                  className="rounded-2xl bg-[color:var(--copper)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-white"
                  type="submit"
                >
                  Continue
                </button>
                <button
                  className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-soft)]"
                  type="button"
                  onClick={() => setStep("phone")}
                >
                  Use a different number
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
