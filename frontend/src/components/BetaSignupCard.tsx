"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function BetaSignupCard() {
  const t = useTranslations("LP.BetaSignup");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

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
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{t("title")}</h3>
      <p className="mt-1 text-xs text-slate-600">{t("description")}</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="input flex-1 min-w-0 text-sm"
        />
        <button
          type="submit"
          className="btn text-sm shrink-0"
          disabled={status === "loading"}
        >
          {status === "loading" ? t("sending") : t("button")}
        </button>
      </form>
      {status === "ok" && (
        <p className="mt-2 text-xs text-emerald-600">{t("thanks")}</p>
      )}
      {status === "err" && (
        <p className="mt-2 text-xs text-red-500">{t("error")}</p>
      )}
    </div>
  );
}
