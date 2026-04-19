"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

type CreateQrResponse = {
  publicUrl: string;
  imageDataUrl?: string;
  error?: string;
};

export function CreateQrForm() {
  const [result, setResult] = useState<CreateQrResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const destinationUrl = String(formData.get("destinationUrl") ?? "");
    const response = await fetch("/api/qrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationUrl }),
    });
    const data = (await response.json()) as CreateQrResponse;
    setLoading(false);

    if (!response.ok) {
      setResult({ publicUrl: "", error: data.error ?? "Could not create QR." });
      return;
    }

    setResult(data);
    event.currentTarget.reset();
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Create dynamic QR</h2>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <input
          name="destinationUrl"
          type="url"
          required
          placeholder="https://your-destination.com"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Generate QR"}
        </button>
      </form>
      {result?.error ? <p className="mt-3 text-sm text-red-600">{result.error}</p> : null}
      {result?.publicUrl ? (
        <div className="mt-4 space-y-3 rounded-md border border-zinc-200 p-4">
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
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
