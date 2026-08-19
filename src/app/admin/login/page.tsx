"use client";

import { Eye, EyeOff, Lock, LogIn, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Wrong email or password. Try again."
        : authError.message);
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", email.trim())
      .single() as { data: { role: string } | null };

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white/10 text-white">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-white">{site.name}</h1>
          <p className="mt-1 text-sm text-brand-200">Admin panel</p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl bg-white p-6 shadow-lift"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Lock className="size-4 text-brand-700" aria-hidden />
            Sign in
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Enter your admin credentials to continue.
          </p>

          {error ? (
            <p className="mt-4 rounded-lg bg-sale-50 px-3 py-2.5 text-sm font-medium text-sale-700">
              {error}
            </p>
          ) : null}

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                className="h-11 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border border-ink-200 px-3 pr-10 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={cn(
              "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg font-semibold text-white transition",
              loading ? "bg-brand-400" : "bg-brand-700 hover:bg-brand-800",
              "disabled:bg-brand-200",
            )}
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-brand-300">
          This is a protected area. Only authorized administrators can access this panel.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
