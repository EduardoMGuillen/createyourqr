"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type SupportEmailButtonProps = {
  variant?: "link" | "button";
  className?: string;
  source?: string;
};

export function SupportEmailButton({
  variant = "link",
  className = "",
  source = "createyourqr-app",
}: SupportEmailButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);
    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          source,
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "Could not send support request.");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "button") {
    return (
      <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 ${className}`}
      >
        Support
      </button>
      {open ? (
        <SupportModal
          source={source}
          loading={loading}
          error={error}
          sent={sent}
          name={name}
          email={email}
          subject={subject}
          message={message}
          onName={setName}
          onEmail={setEmail}
          onSubject={setSubject}
          onMessage={setMessage}
          onSubmit={onSubmit}
          onClose={() => {
            setOpen(false);
            setError(null);
            setSent(false);
          }}
        />
      ) : null}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-zinc-800 underline-offset-4 hover:underline ${className}`}
      >
        Support
      </button>
      {open ? (
        <SupportModal
          source={source}
          loading={loading}
          error={error}
          sent={sent}
          name={name}
          email={email}
          subject={subject}
          message={message}
          onName={setName}
          onEmail={setEmail}
          onSubject={setSubject}
          onMessage={setMessage}
          onSubmit={onSubmit}
          onClose={() => {
            setOpen(false);
            setError(null);
            setSent(false);
          }}
        />
      ) : null}
    </>
  );
}

type SupportModalProps = {
  source: string;
  loading: boolean;
  error: string | null;
  sent: boolean;
  name: string;
  email: string;
  subject: string;
  message: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onSubject: (v: string) => void;
  onMessage: (v: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

function SupportModal(props: SupportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-zinc-900">Contact support</h2>
        <p className="mt-2 text-sm text-zinc-600">
          We will email you back. You will also receive an automatic confirmation from CreateYourQR
          Team.
        </p>
        <form onSubmit={props.onSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            required
            value={props.name}
            onChange={(event) => props.onName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            value={props.email}
            onChange={(event) => props.onEmail(event.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            value={props.subject}
            onChange={(event) => props.onSubject(event.target.value)}
            placeholder="Subject"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <textarea
            required
            rows={5}
            value={props.message}
            onChange={(event) => props.onMessage(event.target.value)}
            placeholder="Describe your issue"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-zinc-500">Source: {props.source}</p>
          {props.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {props.error}
            </p>
          ) : null}
          {props.sent ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Support request sent successfully.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={props.loading}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {props.loading ? "Sending..." : "Send message"}
            </button>
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
