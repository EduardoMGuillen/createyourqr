"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { QrContentKind } from "@prisma/client";

import { appUrl } from "@/lib/app-url";
import {
  downloadStyledQrPng,
  triggerDownloadDataUrl,
} from "@/lib/qr-client-download";
import {
  DEFAULT_QR_STYLE_V1,
  normalizeDestinationUrl,
  qrStyleV1Schema,
  type BarcodePayloadV1,
  type LinkPageThemeV1,
  type QrStyleV1,
} from "@/lib/validators";

import { QrStylePreview } from "@/components/qr-style-preview";

const LOGO_FILE_MAX_BYTES = 200 * 1024;

function createDefaultLinkTheme(): LinkPageThemeV1 {
  return {
    v: 1,
    pageBg: "#f4f4f5",
    pageText: "#18181b",
    cardBg: "#ffffff",
    cardText: "#18181b",
    accent: "#2563eb",
    buttonRadius: "md",
  };
}

function newLinkRow(): { id: string; label: string; url: string } {
  return {
    id:
      typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `r-${Math.random().toString(36).slice(2, 11)}`,
    label: "",
    url: "",
  };
}

type CreateQrResponse = {
  publicUrl: string;
  imageDataUrl?: string;
  error?: string;
  message?: string;
  warning?: string;
  qr?: { styleJson?: unknown; slug?: string; contentKind?: QrContentKind };
};

function previewDataUrl(appBase: string) {
  const base = appBase.replace(/\/$/, "");
  return `${base}/qr/preview`;
}

export function CreateQrForm() {
  const appBase = appUrl.replace(/\/$/, "");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [contentKind, setContentKind] = useState<QrContentKind>(QrContentKind.URL);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [smsE164, setSmsE164] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [plainText, setPlainText] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [barcodeSymbology, setBarcodeSymbology] =
    useState<BarcodePayloadV1["symbology"]>("CODE128");
  const [barcodeData, setBarcodeData] = useState("");
  const [barcodePreviewUrl, setBarcodePreviewUrl] = useState<string | null>(null);
  const [barcodePreviewError, setBarcodePreviewError] = useState<string | null>(null);
  const [linkPageTitle, setLinkPageTitle] = useState("");
  const [linkPageSubtitle, setLinkPageSubtitle] = useState("");
  const [linkPageRows, setLinkPageRows] = useState(() => [newLinkRow()]);
  const [linkTheme, setLinkTheme] = useState<LinkPageThemeV1>(createDefaultLinkTheme);
  const [style, setStyle] = useState<QrStyleV1>(DEFAULT_QR_STYLE_V1);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateQrResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const previewQrData = useMemo(() => {
    if (result?.publicUrl) return result.publicUrl;
    return previewDataUrl(appBase);
  }, [result?.publicUrl, appBase]);

  useEffect(() => {
    if (contentKind !== QrContentKind.BARCODE) {
      setBarcodePreviewUrl(null);
      setBarcodePreviewError(null);
      return;
    }
    const data = barcodeData.trim();
    if (!data) {
      setBarcodePreviewUrl(null);
      setBarcodePreviewError(null);
      return;
    }
    const handle = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/barcodes/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbology: barcodeSymbology, data }),
        });
        const raw = await response.text();
        let payload: { imageDataUrl?: string; error?: string } = {};
        try {
          payload = raw ? (JSON.parse(raw) as typeof payload) : {};
        } catch {
          setBarcodePreviewError("Invalid preview response.");
          setBarcodePreviewUrl(null);
          return;
        }
        if (!response.ok) {
          setBarcodePreviewError(payload.error ?? "Preview failed.");
          setBarcodePreviewUrl(null);
          return;
        }
        if (payload.imageDataUrl) {
          setBarcodePreviewUrl(payload.imageDataUrl);
          setBarcodePreviewError(null);
        }
      } catch {
        setBarcodePreviewError("Could not load preview.");
        setBarcodePreviewUrl(null);
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [contentKind, barcodeSymbology, barcodeData]);

  function buildCreateBody() {
    const base = { contentKind, styleJson: style };
    switch (contentKind) {
      case QrContentKind.URL:
        return {
          ...base,
          destinationUrl: normalizeDestinationUrl(destinationUrl),
        };
      case QrContentKind.EMAIL:
        return {
          ...base,
          payloadJson: {
            v: 1 as const,
            email: emailAddr.trim(),
            ...(emailSubject.trim() ? { subject: emailSubject.trim() } : {}),
            ...(emailBody.trim() ? { body: emailBody.trim() } : {}),
          },
        };
      case QrContentKind.PHONE:
        return {
          ...base,
          payloadJson: { v: 1 as const, e164: phoneE164.trim() },
        };
      case QrContentKind.SMS:
        return {
          ...base,
          payloadJson: {
            v: 1 as const,
            e164: smsE164.trim(),
            ...(smsBody.trim() ? { body: smsBody.trim() } : {}),
          },
        };
      case QrContentKind.TEXT:
        return {
          ...base,
          payloadJson: { v: 1 as const, text: plainText },
        };
      case QrContentKind.WIFI:
        return {
          ...base,
          payloadJson: {
            v: 1 as const,
            ssid: wifiSsid.trim(),
            encryption: wifiEncryption,
            ...(wifiEncryption === "nopass"
              ? {}
              : wifiPassword.length > 0
                ? { password: wifiPassword }
                : {}),
          },
        };
      case QrContentKind.BARCODE:
        return {
          ...base,
          payloadJson: {
            v: 1 as const,
            symbology: barcodeSymbology,
            data: barcodeData.trim(),
          },
        };
      case QrContentKind.LINK_PAGE: {
        const links = linkPageRows
          .map((row) => ({
            label: row.label.trim(),
            url: row.url.trim() ? normalizeDestinationUrl(row.url.trim()) : "",
          }))
          .filter((row) => row.label.length > 0 && row.url.length > 0);
        return {
          ...base,
          payloadJson: {
            v: 1 as const,
            title: linkPageTitle.trim(),
            ...(linkPageSubtitle.trim() ? { subtitle: linkPageSubtitle.trim() } : {}),
            links,
            theme: { ...linkTheme },
          },
        };
      }
      default:
        return { ...base, destinationUrl: normalizeDestinationUrl(destinationUrl) };
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch("/api/qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCreateBody()),
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
        const rawErr = data as unknown as { detail?: string };
        const errText =
          data.error ??
          data.message ??
          (typeof rawErr.detail === "string" ? rawErr.detail : null) ??
          `Could not create QR (${response.status}).`;
        setResult({ publicUrl: "", error: errText });
        return;
      }

      const styleForDownload = (() => {
        if (data.qr?.styleJson && typeof data.qr.styleJson === "object") {
          const parsed = qrStyleV1Schema.safeParse(data.qr.styleJson);
          if (parsed.success) return parsed.data;
        }
        return style;
      })();

      setResult(data);
      setDestinationUrl("");
      setEmailAddr("");
      setEmailSubject("");
      setEmailBody("");
      setPhoneE164("");
      setSmsE164("");
      setSmsBody("");
      setPlainText("");
      setWifiSsid("");
      setWifiPassword("");
      setWifiEncryption("WPA");
      setBarcodeData("");
      setBarcodeSymbology("CODE128");
      setBarcodePreviewUrl(null);
      setBarcodePreviewError(null);
      setLinkPageTitle("");
      setLinkPageSubtitle("");
      setLinkPageRows([newLinkRow()]);
      setLinkTheme(createDefaultLinkTheme());

      void (async () => {
        try {
          const slug = data.qr?.slug ?? "qr-code";
          const kind = data.qr?.contentKind ?? contentKind;
          if (kind === QrContentKind.BARCODE) {
            if (data.imageDataUrl) {
              triggerDownloadDataUrl(data.imageDataUrl, `barcode-${slug}.png`);
            }
            return;
          }
          if (data.publicUrl) {
            await downloadStyledQrPng(data.publicUrl, styleForDownload, slug);
          }
        } catch (e) {
          console.error("Auto-download failed", e);
        }
      })();
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
      <h2 className="text-lg font-semibold text-zinc-900">Create QR or barcode</h2>
      <p className="mt-1 text-sm text-zinc-600">
        {contentKind === QrContentKind.BARCODE ? (
          <>
            Static barcodes encode your value directly in the image (no dynamic redirect). We still save
            a copy under <code className="text-xs">/qr/slug</code> so you can reopen or share the same
            design later.
          </>
        ) : contentKind === QrContentKind.LINK_PAGE ? (
          <>
            Build a simple link-in-bio page (like Linktree) at your <code className="text-xs">/qr/slug</code>{" "}
            URL. Customize page colors and button shape below; the QR module colors still apply to the
            printed code.
          </>
        ) : (
          <>
            Dynamic QR codes use your public <code className="text-xs">/qr/slug</code> link; on scan we
            open a URL, <code className="text-xs">mailto</code>/<code className="text-xs">tel</code>/
            <code className="text-xs">sms</code>, or a small help page for plain text / Wi‑Fi. Colors and
            logo are visual only.
          </>
        )}
      </p>

      <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-10">
        {/* Controls: left on large screens */}
        <div className="relative z-10 min-w-0 lg:order-1">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-800" htmlFor="contentKind">
                Content type
              </label>
              <select
                id="contentKind"
                value={contentKind}
                onChange={(e) => setContentKind(e.target.value as QrContentKind)}
                className="mt-1 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              >
                <option value={QrContentKind.URL}>Website (URL)</option>
                <option value={QrContentKind.EMAIL}>Email</option>
                <option value={QrContentKind.PHONE}>Phone</option>
                <option value={QrContentKind.SMS}>SMS</option>
                <option value={QrContentKind.TEXT}>Plain text</option>
                <option value={QrContentKind.WIFI}>Wi‑Fi</option>
                <option value={QrContentKind.LINK_PAGE}>Link page (Linktree style)</option>
                <option value={QrContentKind.BARCODE}>Barcode (static)</option>
              </select>
            </div>

            {contentKind === QrContentKind.URL ? (
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
            ) : null}

            {contentKind === QrContentKind.EMAIL ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="emailAddr">
                    Email address
                  </label>
                  <input
                    id="emailAddr"
                    type="email"
                    required
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="emailSubject">
                    Subject (optional)
                  </label>
                  <input
                    id="emailSubject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="emailBody">
                    Body (optional)
                  </label>
                  <textarea
                    id="emailBody"
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ) : null}

            {contentKind === QrContentKind.PHONE ? (
              <div>
                <label className="text-sm font-medium text-zinc-800" htmlFor="phoneE164">
                  Phone (E.164)
                </label>
                <input
                  id="phoneE164"
                  type="tel"
                  required
                  placeholder="+34600123456"
                  value={phoneE164}
                  onChange={(e) => setPhoneE164(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">Include country code with +.</p>
              </div>
            ) : null}

            {contentKind === QrContentKind.SMS ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="smsE164">
                    Phone (E.164)
                  </label>
                  <input
                    id="smsE164"
                    type="tel"
                    required
                    placeholder="+34600123456"
                    value={smsE164}
                    onChange={(e) => setSmsE164(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="smsBody">
                    Message (optional)
                  </label>
                  <textarea
                    id="smsBody"
                    rows={3}
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ) : null}

            {contentKind === QrContentKind.TEXT ? (
              <div>
                <label className="text-sm font-medium text-zinc-800" htmlFor="plainText">
                  Text
                </label>
                <textarea
                  id="plainText"
                  rows={6}
                  required
                  maxLength={4096}
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">Shown on a simple page when the QR is scanned.</p>
              </div>
            ) : null}

            {contentKind === QrContentKind.WIFI ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-zinc-600">
                  El QR dinámico abre una página con la cadena Wi‑Fi; en muchos móviles no se une la red
                  sola (usa un QR estático si necesitas conexión automática).
                </p>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="wifiSsid">
                    Network name (SSID)
                  </label>
                  <input
                    id="wifiSsid"
                    type="text"
                    required
                    maxLength={32}
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="wifiEncryption">
                    Security
                  </label>
                  <select
                    id="wifiEncryption"
                    value={wifiEncryption}
                    onChange={(e) =>
                      setWifiEncryption(e.target.value as "WPA" | "WEP" | "nopass")
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Open (no password)</option>
                  </select>
                </div>
                {wifiEncryption !== "nopass" ? (
                  <div>
                    <label className="text-sm font-medium text-zinc-800" htmlFor="wifiPassword">
                      Password
                    </label>
                    <input
                      id="wifiPassword"
                      type="text"
                      required
                      maxLength={63}
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {contentKind === QrContentKind.BARCODE ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="barcodeSymbology">
                    Symbology
                  </label>
                  <select
                    id="barcodeSymbology"
                    value={barcodeSymbology}
                    onChange={(e) =>
                      setBarcodeSymbology(e.target.value as BarcodePayloadV1["symbology"])
                    }
                    className="mt-1 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="CODE128">CODE128</option>
                    <option value="CODE39">CODE39</option>
                    <option value="EAN13">EAN-13</option>
                    <option value="UPCA">UPC-A</option>
                    <option value="ITF14">ITF-14</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="barcodeData">
                    Data to encode
                  </label>
                  <input
                    id="barcodeData"
                    type="text"
                    required
                    maxLength={80}
                    value={barcodeData}
                    onChange={(e) => setBarcodeData(e.target.value)}
                    placeholder={
                      barcodeSymbology === "EAN13"
                        ? "12 or 13 digits"
                        : barcodeSymbology === "UPCA"
                          ? "11 or 12 digits"
                          : barcodeSymbology === "ITF14"
                            ? "13 or 14 digits"
                            : "Alphanumeric value"
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    EAN-13 / UPC-A / ITF-14: digits only. CODE39: A–Z, 0–9, space, and . $ / + % -.
                  </p>
                </div>
              </div>
            ) : null}

            {contentKind === QrContentKind.LINK_PAGE ? (
              <div className="flex flex-col gap-4 rounded-md border border-zinc-200 bg-zinc-50/80 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Page content</p>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="linkPageTitle">
                    Page title
                  </label>
                  <input
                    id="linkPageTitle"
                    type="text"
                    required
                    maxLength={64}
                    value={linkPageTitle}
                    onChange={(e) => setLinkPageTitle(e.target.value)}
                    placeholder="Your name or brand"
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-800" htmlFor="linkPageSubtitle">
                    Subtitle (optional)
                  </label>
                  <input
                    id="linkPageSubtitle"
                    type="text"
                    maxLength={200}
                    value={linkPageSubtitle}
                    onChange={(e) => setLinkPageSubtitle(e.target.value)}
                    placeholder="Short line under the title"
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-800">Links</span>
                    <button
                      type="button"
                      onClick={() => setLinkPageRows((rows) => [...rows, newLinkRow()])}
                      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      Add link
                    </button>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {linkPageRows.map((row, index) => (
                      <li
                        key={row.id}
                        className="grid gap-2 rounded-md border border-zinc-200 bg-white p-3 sm:grid-cols-2"
                      >
                        <div>
                          <label className="text-xs font-medium text-zinc-600" htmlFor={`link-label-${row.id}`}>
                            Label
                          </label>
                          <input
                            id={`link-label-${row.id}`}
                            type="text"
                            value={row.label}
                            onChange={(e) =>
                              setLinkPageRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, label: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="Instagram"
                            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-zinc-600" htmlFor={`link-url-${row.id}`}>
                            URL
                          </label>
                          <input
                            id={`link-url-${row.id}`}
                            type="text"
                            inputMode="url"
                            value={row.url}
                            onChange={(e) =>
                              setLinkPageRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, url: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="https://…"
                            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        {linkPageRows.length > 1 ? (
                          <div className="sm:col-span-2">
                            <button
                              type="button"
                              onClick={() =>
                                setLinkPageRows((rows) => rows.filter((r) => r.id !== row.id))
                              }
                              className="text-xs font-medium text-red-600 underline"
                            >
                              Remove link
                            </button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-zinc-500">At least one link with label and https URL is required.</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Page theme</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-zinc-600" htmlFor="lt-page-bg">
                        Page background
                      </label>
                      <input
                        id="lt-page-bg"
                        type="color"
                        value={linkTheme.pageBg}
                        onChange={(e) =>
                          setLinkTheme((t) => ({ ...t, pageBg: e.target.value }))
                        }
                        className="mt-1 h-9 w-full cursor-pointer rounded border border-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600" htmlFor="lt-page-text">
                        Page text
                      </label>
                      <input
                        id="lt-page-text"
                        type="color"
                        value={linkTheme.pageText}
                        onChange={(e) =>
                          setLinkTheme((t) => ({ ...t, pageText: e.target.value }))
                        }
                        className="mt-1 h-9 w-full cursor-pointer rounded border border-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600" htmlFor="lt-card-bg">
                        Button fill
                      </label>
                      <input
                        id="lt-card-bg"
                        type="color"
                        value={linkTheme.cardBg}
                        onChange={(e) =>
                          setLinkTheme((t) => ({ ...t, cardBg: e.target.value }))
                        }
                        className="mt-1 h-9 w-full cursor-pointer rounded border border-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600" htmlFor="lt-card-text">
                        Button text
                      </label>
                      <input
                        id="lt-card-text"
                        type="color"
                        value={linkTheme.cardText}
                        onChange={(e) =>
                          setLinkTheme((t) => ({ ...t, cardText: e.target.value }))
                        }
                        className="mt-1 h-9 w-full cursor-pointer rounded border border-zinc-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-zinc-600" htmlFor="lt-accent">
                        Button border / accent
                      </label>
                      <input
                        id="lt-accent"
                        type="color"
                        value={linkTheme.accent}
                        onChange={(e) =>
                          setLinkTheme((t) => ({ ...t, accent: e.target.value }))
                        }
                        className="mt-1 h-9 w-full max-w-[8rem] cursor-pointer rounded border border-zinc-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-zinc-600" htmlFor="lt-radius">
                        Button corners
                      </label>
                      <select
                        id="lt-radius"
                        value={linkTheme.buttonRadius}
                        onChange={(e) =>
                          setLinkTheme((t) => ({
                            ...t,
                            buttonRadius: e.target.value as LinkPageThemeV1["buttonRadius"],
                          }))
                        }
                        className="mt-1 w-full max-w-xs rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                      >
                        <option value="sm">Slightly rounded</option>
                        <option value="md">Rounded</option>
                        <option value="full">Pill</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {contentKind !== QrContentKind.BARCODE ? (
              <>
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
              </>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Generate"}
            </button>
          </form>
        </div>

        {/* Live preview: right on large screens */}
        <div className="relative z-0 lg:order-2 lg:sticky lg:top-24">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-500 lg:text-left">
            {contentKind === QrContentKind.BARCODE ? "Barcode preview" : "Live preview"}
          </p>
          <div className="mt-2">
            {contentKind === QrContentKind.BARCODE ? (
              <div className="mx-auto flex min-h-[200px] max-w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-4 lg:mx-0">
                {barcodePreviewError ? (
                  <p className="text-center text-xs text-red-600">{barcodePreviewError}</p>
                ) : barcodePreviewUrl ? (
                  <Image
                    src={barcodePreviewUrl}
                    alt="Barcode preview"
                    width={320}
                    height={120}
                    unoptimized
                    className="max-h-40 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-center text-xs text-zinc-500">
                    Enter data to see a preview (debounced).
                  </p>
                )}
              </div>
            ) : (
              <QrStylePreview data={previewQrData} style={style} className="mx-auto lg:mx-0" />
            )}
          </div>
          {!result?.publicUrl && contentKind !== QrContentKind.BARCODE ? (
            <p className="mt-2 text-center text-xs text-zinc-500 lg:text-left">
              Sample link until your QR is created; then it matches the real public URL.
            </p>
          ) : null}
        </div>
      </div>

      {result?.error ? <p className="mt-4 text-sm text-red-600">{result.error}</p> : null}
      {result?.publicUrl && result.warning ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {result.warning}
        </p>
      ) : null}
      {result?.publicUrl ? (
        <div className="mt-6 space-y-3 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">
            {result.qr?.contentKind === QrContentKind.BARCODE
              ? "Saved link (reopens the same barcode): "
              : result.qr?.contentKind === QrContentKind.LINK_PAGE
                ? "Your link page: "
                : "Public QR URL: "}
            <a className="text-zinc-900 underline" href={result.publicUrl} target="_blank">
              {result.publicUrl}
            </a>
          </p>
          {result.imageDataUrl ? (
            result.qr?.contentKind === QrContentKind.BARCODE ? (
              <Image
                src={result.imageDataUrl}
                alt="Generated barcode"
                width={360}
                height={140}
                unoptimized
                className="max-h-48 max-w-full rounded border border-zinc-200 object-contain"
              />
            ) : (
              <Image
                src={result.imageDataUrl}
                alt="Generated QR code"
                width={160}
                height={160}
                unoptimized
                className="h-40 w-40 rounded border border-zinc-200"
              />
            )
          ) : (
            <QrStylePreview data={result.publicUrl} style={resultStyle} size={200} />
          )}
        </div>
      ) : null}
    </section>
  );
}
