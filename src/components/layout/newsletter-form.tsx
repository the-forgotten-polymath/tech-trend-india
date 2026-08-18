"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Newsletter sign-up. This demo keeps the address on the client only — wire it
 * to your email provider (or a server action) before going live.
 */
export function NewsletterForm({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    setState(valid ? "done" : "error");
  };

  if (state === "done") {
    return (
      <p
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
          tone === "dark" ? "bg-white/10 text-white" : "bg-brand-50 text-brand-800",
          className,
        )}
      >
        <Check className="size-4 shrink-0" aria-hidden />
        You&apos;re on the list. Watch your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-2", className)} noValidate>
      <div className="flex gap-2">
        <label htmlFor={`newsletter-email-${tone}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-email-${tone}`}
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setState("idle");
          }}
          placeholder="you@example.com"
          aria-invalid={state === "error"}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-lg border px-3.5 text-sm focus:outline-none",
            tone === "dark"
              ? "border-white/20 bg-white/10 text-white placeholder:text-brand-300 focus:border-white/40"
              : "border-ink-200 bg-white placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100",
            state === "error" && "border-sale-500",
          )}
        />
        <button
          type="submit"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg transition",
            tone === "dark"
              ? "bg-white text-brand-900 hover:bg-brand-100"
              : "bg-brand-700 text-white hover:bg-brand-800",
          )}
          aria-label="Subscribe to the newsletter"
        >
          <Send className="size-4" aria-hidden />
        </button>
      </div>
      {state === "error" ? (
        <p className={cn("text-xs", tone === "dark" ? "text-peach-200" : "text-sale-600")}>
          Enter a valid email address.
        </p>
      ) : null}
    </form>
  );
}
