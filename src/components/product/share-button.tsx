"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

/**
 * Uses the Web Share sheet when the browser supports it, and falls back to
 * copying the product link to the clipboard.
 */
export function ShareButton({
  title,
  text,
  className,
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text ?? title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify({ tone: "info", title: "Link copied", description: title });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard blocked — nothing to report.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4 text-brand-700" aria-hidden />
      ) : (
        <Share2 className="size-4" aria-hidden />
      )}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
