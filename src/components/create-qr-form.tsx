"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import { normalizeDestinationUrl, type QrStyleV1 } from "@/lib/validators";

import { QrStylePreview } from "@/components/qr-style-preview";

const LOGO_FILE_MAX_BYTES = 200 * 1024;

const defaultStyle: QrStyleV1 = {
  v: 1,
  fg: "#0a0a0a",
  bg: "#ffffff",
  dotsType: "rounded",
  cornersSquareType: "extra-rounded",
  cornersDotType: "dot",
  logoDataUrl: null,
};

type CreateQrResponse = {
  publicUrl: string;
  imageDataUrl?: string;
  error?: string;
  qr?: { styleJson?: unknown; slug?: string };
};

function previewDataUrl(appBase: string) {
  const base = appBase.replace(/\/$/, "");
  return `${base}/qr/preview`;
}

export function CreateQrForm() {
  const appBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [style, setStyle] = useState<QrStyleV1>(defaultStyle);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateQrResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const previewQrData = useMemo(() => {
    if (result?.publicUrl) return result.publicUrl;
    return previewDataUrl(appBase);
  }, [result?.publicUrl, appBase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const normalized = normalizeDestinationUrl(destinationUrl);
      const response = await fetch("/api/qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl: normalized,
          styleJson: style,
        }),
      });

      const raw = await response.text();
      let data: CreateQrResponse = { publicUrl: "" };
      try {
        data = raw ? (JSON.parse(raw) as CreateQrResponse) : data;
      } catch {
        setResult({ publicUrl: "", error: "Invalid server response." });
        return;
      }

      if (!response.ok) {
        setResult({ publicUrl: "", error: data.error ?? "Could not create QR." });
        return;
      }

      setResult(data);
      setDestinationUrl("");
    } catch {
      setResult({
        publicUrl: "",
        error: "Could not reach the server. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function onLogoFile(file: File | null) {
    setLogoError(null);
    if (!file) {
      setStyle((s) => ({ ...s, logoDataUrl: null }));
      return;
    }
    if (file.size > LOGO_FILE_MAX_BYTES) {
      setLogoError("Logo must be 200KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null;
      setStyle((s) => ({ ...s, logoDataUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  const resultStyle =
    result?.qr?.styleJson && typeof result.qr.styleJson === "object"
      ? (result.qr.styleJson as QrStyleV1)
      : style;

  return (
    <section className="relative isolate rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Create dynamic QR</h2>
      <p className="mt-1 text-sm text-zinc-600">
        The QR always points at your public <code className="text-xs">/qr/slug</code> link; colors
        and logo are visual only.
      </p>

      <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-10">
        {/* Controls: left on large screens */}
        <div className="relative z-10 min-w-0 lg:order-1">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-800" htmlFor="destinationUrl">
                Destination URL
              </label>
              <input
                id="destinationUrl"
                name="destinationUrl"
                type="text"
                inputMode="url"
                autoComplete="url"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="your-site.com or https://your-site.com"
                className="mt-1 w-full cursor-text rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 caret-zinc-900 outline-none selection:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-800" htmlFor="fg">
                  Module color
                </label>
                <input
                  id="fg"
                  type="color"
                  value={style.fg}
                  onChange={(e) => setStyle((s) => ({ ...s, fg: e.target.value }))}
                  className="mt-1 h-10 w-full cursor-pointer rounded border border-zinc-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-800" htmlFor="bg">
                  Background
                </label>
                <input
                  id="bg"
                  type="color"
                  value={style.bg}
                  onChange={(e) => setStyle((s) => ({ ...s, bg: e.target.value }))}
                  className="mt-1 h-10 w-full cursor-pointer rounded border border-zinc-300"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-800" htmlFor="dotsType">
                Dot style
              </label>
              <select
                id="dotsType"
                value={style.dotsType}
                onChange={(e) =>
                  setStyle((s) => ({ ...s, dotsType: e.target.value as QrStyleV1["dotsType"] }))
                }
                className="mt-1 w-full cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="rounded">Rounded</option>
                <option value="dots">Dots</option>
                <option value="classy">Classy</option>
                <option value="classy-rounded">Classy rounded</option>
                <option value="square">Square</option>
                <option value="extra-rounded">Extra rounded</option>
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-800" htmlFor="cornersSquareType">
                  Corner frame
                </label>
                <select
                  id="cornersSquareType"
                  value={style.cornersSquareType}
                  onChange={(e) =>
                    setStyle((s) => ({
                      ...s,
                      cornersSquareType: e.target.value as QrStyleV1["cornersSquareType"],
                    }))
                  }
                  className="mt-1 w-full cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="extra-rounded">Extra rounded</option>
                  <option value="dot">Dot</option>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="classy">Classy</option>
                  <option value="classy-rounded">Classy rounded</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-800" htmlFor="cornersDotType">
                  Corner dot
                </label>
                <select
                  id="cornersDotType"
                  value={style.cornersDotType}
                  onChange={(e) =>
                    setStyle((s) => ({
                      ...s,
                      cornersDotType: e.target.value as QrStyleV1["cornersDotType"],
                    }))
                  }
                  className="mt-1 w-full cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="dot">Dot</option>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="classy">Classy</option>
                  <option value="classy-rounded">Classy rounded</option>
                  <option value="extra-rounded">Extra rounded</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-zinc-800">Center logo (optional)</span>
              <input
                ref={logoInputRef}
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => onLogoFile(e.target.files?.[0] ?? null)}
                className="sr-only"
                tabIndex={-1}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  Choose logo file
                </button>
                {style.logoDataUrl ? (
                  <button
                    type="button"
                    onClick={() => onLogoFile(null)}
                    className="text-sm font-medium text-zinc-700 underline"
                  >
                    Remove logo
                  </button>
                ) : null}
              </div>
              {logoError ? <p className="mt-1 text-xs text-red-600">{logoError}</p> : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Generate QR"}
            </button>
          </form>
        </div>

        {/* Live preview: right on large screens */}
        <div className="relative z-0 lg:order-2 lg:sticky lg:top-24">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-500 lg:text-left">
            Live preview
          </p>
          <div className="mt-2">
            <QrStylePreview data={previewQrData} style={style} className="mx-auto lg:mx-0" />
          </div>
          {!result?.publicUrl ? (
            <p className="mt-2 text-center text-xs text-zinc-500 lg:text-left">
              Sample link until your QR is created; then it matches the real public URL.
            </p>
          ) : null}
        </div>
      </div>

      {result?.error ? <p className="mt-4 text-sm text-red-600">{result.error}</p> : null}
      {result?.publicUrl ? (
        <div className="mt-6 space-y-3 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">
            Public QR URL:{" "}
            <a className="text-zinc-900 underline" href={result.publicUrl} target="_blank">
              {result.publicUrl}
            </a>
          </p>
          {result.imageDataUrl ? (
            <Image
              src={result.imageDataUrl}
              alt="Generated QR code"
              width={160}
              height={160}
              unoptimized
              className="h-40 w-40 rounded border border-zinc-200"
            />
          ) : (
            <QrStylePreview data={result.publicUrl} style={resultStyle} size={200} />
          )}
        </div>
      ) : null}
    </section>
  );
}
