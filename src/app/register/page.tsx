"use client";

import { Suspense, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { AuthUrlErrorBanner } from "@/components/auth-url-error-banner";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { PasswordField } from "@/components/password-field";
import { RegistrationSuccessDialog } from "@/components/registration-success-dialog";
import type { ResendEmailFailureCode } from "@/server/email/resend-failure-codes";

type RegisterResponse = {
  user?: { email: string };
  welcomeEmailSent?: boolean;
  welcomeEmailFailureCode?: ResendEmailFailureCode;
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
  const [welcomeEmailFailureCode, setWelcomeEmailFailureCode] =
    useState<ResendEmailFailureCode | null>(null);
  const [continuing, setContinuing] = useState(false);
  const pendingPasswordRef = useRef("");
  const fromInstantQr = searchParams.get("from") === "instant-qr";
  const instantTarget = searchParams.get("target")?.trim() ?? "";

  function normalizeUrl(raw: string) {
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }

  async function createInstantQrForNewAccount() {
    if (!fromInstantQr || !instantTarget) return;
    const destinationUrl = normalizeUrl(instantTarget);
    if (!destinationUrl) return;
    const response = await fetch("/api/qrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentKind: "URL",
        destinationUrl,
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "Could not save your QR automatically.");
    }
  }

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
    setWelcomeEmailFailureCode(
      data.welcomeEmailSent ? null : (data.welcomeEmailFailureCode ?? null),
    );
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
    try {
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      pendingPasswordRef.current = "";

      if (signInResult?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        setShowSuccess(false);
        return;
      }
      if (signInResult?.ok) {
        try {
          await createInstantQrForNewAccount();
          const nextUrl = fromInstantQr ? "/dashboard?instantQr=saved" : signInResult.url ?? "/dashboard";
          window.location.assign(nextUrl);
          return;
        } catch (createError) {
          const message =
            createError instanceof Error
              ? createError.message
              : "Account created, but the QR could not be saved automatically.";
          setError(message);
          setShowSuccess(false);
          return;
        }
      }
    } finally {
      setContinuing(false);
    }
  }

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <RegistrationSuccessDialog
        open={showSuccess}
        email={successEmail}
        emailSent={welcomeEmailSent}
        emailFailureCode={welcomeEmailFailureCode}
        continuing={continuing}
        onContinue={handleContinueAfterSuccess}
      />

      <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Start free with 5 days and 50 scans per QR.
      </p>
      {fromInstantQr ? (
        <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          We will save the QR you just created into your new dashboard right after sign-up.
        </p>
      ) : null}
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
        <div>
          <label htmlFor="register-password" className="text-sm font-medium text-zinc-800">
            Password
          </label>
          <div className="mt-1">
            <PasswordField
              id="register-password"
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              showStrength
            />
          </div>
        </div>
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
