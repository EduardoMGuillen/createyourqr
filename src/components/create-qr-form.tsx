"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
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

    const normalized = normalizeDestinationUrl(destinationUrl);
    const response = await fetch("/api/qrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationUrl: normalized,
        styleJson: style,
      }),
    });
    const data = (await response.json()) as CreateQrResponse;
    setLoading(false);

    if (!response.ok) {
      setResult({ publicUrl: "", error: data.error ?? "Could not create QR." });
      return;
    }

    setResult(data);
    setDestinationUrl("");
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
    <section className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Create dynamic QR</h2>
      <p className="mt-1 text-sm text-zinc-600">
        The QR always points at your public <code className="text-xs">/qr/slug</code> link; colors
        and logo are visual only.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr,280px] md:items-start">
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
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
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
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
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
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
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
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
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
            <label className="text-sm font-medium text-zinc-800" htmlFor="logo">
              Center logo (optional)
            </label>
            <input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => onLogoFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-zinc-600"
            />
            {logoError ? <p className="mt-1 text-xs text-red-600">{logoError}</p> : null}
            {style.logoDataUrl ? (
              <button
                type="button"
                onClick={() => onLogoFile(null)}
                className="mt-2 text-xs font-medium text-zinc-700 underline"
              >
                Remove logo
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Generate QR"}
          </button>
        </form>

        <div className="md:sticky md:top-24">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
            Live preview
          </p>
          <QrStylePreview data={previewQrData} style={style} className="mt-2" />
          {!result?.publicUrl ? (
            <p className="mt-2 text-center text-xs text-zinc-500">
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
