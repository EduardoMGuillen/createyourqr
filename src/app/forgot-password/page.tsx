"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, setState] = useState<{ error?: string; message?: string }>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({});
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setState({ error: "Could not request reset link." });
      return;
    }

    const data = (await response.json()) as { resetToken?: string };
    setState({
      message: data.resetToken
        ? `Dev token: ${data.resetToken}`
        : "If your email exists, we sent reset instructions.",
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-2 text-sm text-zinc-600">Request a secure reset token.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="you@email.com"
        />
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.message ? <p className="text-sm text-green-700">{state.message}</p> : null}
        <button
          type="submit"
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Send reset request
        </button>
      </form>
      <Link href="/reset-password" className="mt-6 text-sm text-zinc-700 underline">
        I already have a token
      </Link>
    </main>
  );
}
