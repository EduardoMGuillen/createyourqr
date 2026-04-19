"use client";

import { Suspense, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { AuthUrlErrorBanner } from "@/components/auth-url-error-banner";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { RegistrationSuccessDialog } from "@/components/registration-success-dialog";

type RegisterResponse = {
  user?: { email: string };
  welcomeEmailSent?: boolean;
};

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const pendingPasswordRef = useRef("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not create your account.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as RegisterResponse;
    pendingPasswordRef.current = payload.password;
    setSuccessEmail(data.user?.email ?? payload.email);
    setWelcomeEmailSent(Boolean(data.welcomeEmailSent));
    setShowSuccess(true);
    setLoading(false);
  }

  async function handleContinueAfterSuccess() {
    const email = successEmail;
    const password = pendingPasswordRef.current;
    if (!email || !password) {
      setError("Could not complete sign-in. Try logging in manually.");
      setShowSuccess(false);
      return;
    }

    setContinuing(true);
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setContinuing(false);
    pendingPasswordRef.current = "";

    if (signInResult?.error) {
      setError("Account created but sign-in failed. Try logging in.");
      setShowSuccess(false);
      return;
    }
    if (signInResult?.ok) {
      window.location.assign(signInResult.url ?? "/dashboard");
    }
  }

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <RegistrationSuccessDialog
        open={showSuccess}
        email={successEmail}
        emailSent={welcomeEmailSent}
        continuing={continuing}
        onContinue={handleContinueAfterSuccess}
      />

      <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Start free with 5 days and 50 scans per QR.
      </p>
      <Suspense fallback={null}>
        <AuthUrlErrorBanner />
      </Suspense>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="name"
          type="text"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Your name"
        />
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="you@email.com"
        />
        <input
          name="password"
          type="password"
          minLength={8}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Minimum 8 characters"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || showSuccess}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="mt-3">
        <GoogleSignInButton callbackUrl="/dashboard" />
      </div>
      <Link href="/login" className="mt-6 text-sm text-zinc-700 underline">
        Already have an account? Log in
      </Link>
    </main>
  );
}
