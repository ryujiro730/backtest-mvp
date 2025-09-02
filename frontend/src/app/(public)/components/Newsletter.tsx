// src/app/(public)/components/Newsletter.tsx など
"use client";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setStatus(json.ok ? "ok" : "err");
      if (json.ok) setEmail("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 mt-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="input w-full sm:w-auto"
      />
      <button
        type="submit"
        className="btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Early Access"}
      </button>
      {status === "ok"  && <span className="text-emerald-400 text-sm">Thanks!</span>}
      {status === "err" && <span className="text-red-400 text-sm">Failed. Try again</span>}
    </form>
  );
}
