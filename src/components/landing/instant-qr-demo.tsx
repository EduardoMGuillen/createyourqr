"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { QrStylePreview } from "@/components/qr-style-preview";
import { downloadStyledQrPng } from "@/lib/qr-client-download";
import { DEFAULT_QR_STYLE_V1 } from "@/lib/validators";

function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function InstantQrDemo() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  const canGenerate = destinationUrl.trim().length > 0 && !isGenerating;
  const hasResult = generatedUrl.length > 0;

  const safePreviewUrl = useMemo(() => {
    return hasResult ? generatedUrl : "https://createyourqr.com/your-campaign";
  }, [generatedUrl, hasResult]);
  const registerHref = useMemo(() => {
    if (!generatedUrl) return "/register";
    return `/register?from=instant-qr&target=${encodeURIComponent(generatedUrl)}`;
  }, [generatedUrl]);

  async function onGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canGenerate) return;
    setIsGenerating(true);
    const normalized = normalizeUrl(destinationUrl);
    // Conversion: instant feedback before sign-up reduces drop-off.
    window.setTimeout(() => {
      setGeneratedUrl(normalized);
      setIsGenerating(false);
      setShowAccountPrompt(true);
    }, 180);
  }

  async function onDownload() {
    if (!hasResult) return;
    await downloadStyledQrPng(generatedUrl, DEFAULT_QR_STYLE_V1, "createyourqr-preview");
  }

  return (
    <section
      id="instant-generator"
      className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-900/5 md:p-7"
      aria-labelledby="instant-generator-title"
    >
      <h2 id="instant-generator-title" className="text-xl font-semibold tracking-tight text-zinc-900">
        Generate a dynamic QR in 10 seconds
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        No login needed to start. Paste your link, preview instantly, then keep it active with scan
        tracking.
      </p>

      <form onSubmit={onGenerate} className="mt-4 space-y-3">
        <label htmlFor="instant-url" className="block text-sm font-medium text-zinc-800">
          Destination URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="instant-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            value={destinationUrl}
            onChange={(event) => setDestinationUrl(event.target.value)}
            placeholder="your-site.com/offer"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none ring-violet-500/30 focus:ring-4"
          />
          <button
            type="submit"
            disabled={!canGenerate}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Creating..." : "Create QR"}
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <QrStylePreview data={safePreviewUrl} style={DEFAULT_QR_STYLE_V1} size={210} />

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Your QR is active</span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Scans detected: 3 today</span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">Editable anytime</span>
          </div>
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Create your account to save this QR in your dashboard and keep editing links anytime.
          </p>
          <p className="text-xs text-zinc-600">
            Account owners can monitor scans, update destinations, and keep campaign links organized.
          </p>

          {hasResult ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => void onDownload()}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                Download PNG
              </button>
              {/* Conversion: secondary CTA appears only after value is delivered. */}
              <Link
                href={registerHref}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Create account and keep this QR active
              </Link>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Generate first, then activate it in one click.</p>
          )}
        </div>
      </div>

      {showAccountPrompt ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activate-qr-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <p className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              QR generated successfully
            </p>
            <h3 id="activate-qr-title" className="mt-3 text-xl font-semibold text-zinc-900">
              Create your account to activate this QR
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              You already generated value. Finish in one step to store it in your dashboard and edit it
              any time.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={registerHref}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Create free account
              </Link>
              <button
                type="button"
                onClick={() => setShowAccountPrompt(false)}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Continue exploring
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
