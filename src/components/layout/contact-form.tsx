"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOPICS = ["Order help", "Product question", "Bulk / corporate gifting", "Returns", "Other"];

/**
 * Contact form. Nothing is transmitted in this demo — hook it up to your
 * helpdesk, an email API or a server action when you go live.
 */
export function ContactForm() {
  const [fields, setFields] = useState({
    name: "",
    email: "",
    orderId: "",
    topic: TOPICS[0],
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof typeof fields) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (fields.name.trim().length < 2) next.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim()))
      next.email = "Enter a valid email address.";
    if (fields.message.trim().length < 10) next.message = "A little more detail helps us help you.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-bold text-emerald-950">Message noted</h2>
        <p className="mt-2 max-w-md text-emerald-900">
          Thanks {fields.name.split(" ")[0]}. In this demo the form doesn&apos;t send anything — on a
          live store your message would land in our inbox and we&apos;d reply to {fields.email} within
          a working day.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setFields({ name: "", email: "", orderId: "", topic: TOPICS[0], message: "" });
          }}
          className={buttonClasses("dark", "md", "mt-5")}
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold">Send us a message</h2>
      <p className="mt-1 text-sm text-ink-500">
        Include your order number if your question is about a delivery.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Your name"
          value={fields.name}
          onChange={update("name")}
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          id="contact-email"
          label="Email"
          type="email"
          value={fields.email}
          onChange={update("email")}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="contact-order"
          label="Order number (optional)"
          value={fields.orderId}
          onChange={update("orderId")}
          placeholder="GFT-260815-1234"
        />
        <div>
          <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-medium text-ink-700">
            Topic
          </label>
          <select
            id="contact-topic"
            value={fields.topic}
            onChange={update("topic")}
            className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink-700">
            How can we help?
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={fields.message}
            onChange={update("message")}
            aria-invalid={Boolean(errors.message)}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-ink-400 focus:ring-2 focus:ring-brand-100 focus:outline-none",
              errors.message ? "border-brand-400" : "border-ink-200 focus:border-brand-300",
            )}
            placeholder="Tell us what you need — the more detail, the faster we can sort it."
          />
          {errors.message ? (
            <p className="mt-1 text-xs text-brand-700">{errors.message}</p>
          ) : null}
        </div>
      </div>

      <button type="submit" className={buttonClasses("primary", "lg", "mt-6 w-full sm:w-auto")}>
        <Send className="size-4" aria-hidden />
        Send message
      </button>
    </form>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3 text-sm placeholder:text-ink-400 focus:ring-2 focus:ring-brand-100 focus:outline-none",
          error ? "border-brand-400" : "border-ink-200 focus:border-brand-300",
        )}
      />
      {error ? <p className="mt-1 text-xs text-brand-700">{error}</p> : null}
    </div>
  );
}
