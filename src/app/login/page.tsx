"use client";

import { Suspense, FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { AuthUrlErrorBanner } from "@/components/auth-url-error-banner";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { PasswordField } from "@/components/password-field";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard",
    });

    setLoading(false);
    if (response?.error) {
      setError("Invalid email or password.");
      return;
    }
    if (response?.ok) {
      window.location.assign(response.url ?? "/dashboard");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Access your QR dashboard and manage active campaigns.
      </p>
      <Suspense fallback={null}>
        <AuthUrlErrorBanner />
      </Suspense>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="you@email.com"
        />
        <div>
          <label htmlFor="login-password" className="text-sm font-medium text-zinc-800">
            Password
          </label>
          <div className="mt-1">
            <PasswordField
              id="login-password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="Password"
              showStrength={false}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div className="mt-3">
        <GoogleSignInButton callbackUrl="/dashboard" />
      </div>
      <div className="mt-6 flex justify-between text-sm">
        <Link className="text-zinc-700 underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-zinc-700 underline" href="/register">
          Create account
        </Link>
      </div>
    </main>
  );
}
