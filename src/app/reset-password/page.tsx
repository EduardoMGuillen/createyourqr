"use client";

import { Suspense, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PasswordField } from "@/components/password-field";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("token");
    if (fromQuery) {
      setToken(fromQuery);
    }
  }, [searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const rawToken = String(formData.get("token") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(data?.error ?? "Could not reset password.");
        return;
      }

      setMessage("Your password was updated. You can log in with your new password.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Set new password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Paste the reset token from your email, or open the link from the email directly (the token
        field will fill in automatically).
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="reset-token" className="text-sm font-medium text-zinc-800">
            Reset token
          </label>
          <textarea
            id="reset-token"
            name="token"
            required
            rows={3}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full resize-y rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            placeholder="Long token from the email link"
            spellCheck={false}
          />
        </div>
        <div>
          <label htmlFor="reset-password" className="text-sm font-medium text-zinc-800">
            New password
          </label>
          <div className="mt-1">
            <PasswordField
              id="reset-password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              showStrength
            />
          </div>
        </div>
        <div>
          <label htmlFor="reset-password-confirm" className="text-sm font-medium text-zinc-800">
            Confirm new password
          </label>
          <div className="mt-1">
            <PasswordField
              id="reset-password-confirm"
              name="passwordConfirm"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat password"
              showStrength={false}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? (
          <p className="text-sm text-green-800">
            {message}{" "}
            <Link href="/login" className="font-medium underline">
              Go to log in
            </Link>
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      <div className="mt-8 text-sm text-zinc-700">
        <Link href="/forgot-password" className="underline">
          Request a new link
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
          <p className="text-sm text-zinc-600">Loading…</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
