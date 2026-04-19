"use client";

import { FormEvent, useState } from "react";

export default function ResetPasswordPage() {
  const [state, setState] = useState<{ error?: string; message?: string }>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({});
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: String(formData.get("token") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setState({ error: data?.error ?? "Could not reset password." });
      return;
    }

    setState({ message: "Password updated. You can now log in." });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Set new password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Paste the token from your reset request and choose a new password.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="token"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Reset token"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="New password"
        />
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.message ? <p className="text-sm text-green-700">{state.message}</p> : null}
        <button
          type="submit"
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Update password
        </button>
      </form>
    </main>
  );
}
