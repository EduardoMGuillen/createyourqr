"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Could not send reset email. Try again later.");
        return;
      }

      setMessage(
        "If an account exists with that email and it uses a password, we sent a reset link. Check your inbox and spam folder. The link expires in one hour.",
      );
      event.currentTarget.reset();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Forgot password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enter the email you use for CreateYourQR. We will send you a link to set a new password (only
        for accounts that sign in with email and password, not Google-only).
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="forgot-email" className="text-sm font-medium text-zinc-800">
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            placeholder="you@email.com"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-800">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <div className="mt-8 flex flex-col gap-2 text-sm text-zinc-700">
        <Link href="/login" className="underline">
          Back to log in
        </Link>
        <Link href="/reset-password" className="underline">
          I already have a link from my email
        </Link>
      </div>
    </main>
  );
}
