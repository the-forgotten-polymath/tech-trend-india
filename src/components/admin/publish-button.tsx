// @ts-nocheck
"use client";

import { Check, Loader2, Rocket } from "lucide-react";
import { useState } from "react";

/**
 * Triggers a full site rebuild so admin panel changes (products, prices,
 * categories) appear on the live storefront. Takes ~60 seconds.
 */
export function PublishButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const publish = async () => {
    setState("loading");
    setMessage("");

    try {
      // The secret is the last 12 chars of the service role key
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(-12) || "revalidate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(data.error || "Failed to publish");
        return;
      }

      setState("done");
      setMessage(data.message || "Changes will be live in ~60 seconds.");
      setTimeout(() => setState("idle"), 5000);
    } catch {
      setState("error");
      setMessage("Network error. Try again.");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={publish}
        disabled={state === "loading"}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
          state === "done"
            ? "bg-emerald-600 text-white"
            : state === "error"
              ? "bg-sale-600 text-white"
              : "bg-brand-700 text-white hover:bg-brand-800 disabled:bg-brand-300"
        }`}
      >
        {state === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : state === "done" ? (
          <Check className="size-4" />
        ) : (
          <Rocket className="size-4" />
        )}
        {state === "loading"
          ? "Publishing…"
          : state === "done"
            ? "Published!"
            : state === "error"
              ? "Failed"
              : "Publish to store"}
      </button>
      {message && (
        <p className={`mt-2 text-xs ${state === "error" ? "text-sale-600" : "text-emerald-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
