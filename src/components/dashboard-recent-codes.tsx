"use client";

import type { QrCode } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

import { DashboardQrActions } from "@/components/dashboard-qr-actions";
import { QrPreviewModal } from "@/components/qr-preview-modal";
import { formatQrDestinationCell } from "@/lib/qr-content";

type CyqrCreatedDetail = {
  qr: QrCode;
  publicUrl: string;
  imageDataUrl?: string;
  openPreview: boolean;
};

type DashboardRecentCodesProps = {
  initialQrs: QrCode[];
  appUrl: string;
};

export function DashboardRecentCodes({ initialQrs, appUrl }: DashboardRecentCodesProps) {
  const [rows, setRows] = useState(initialQrs);
  const sectionRef = useRef<HTMLElement>(null);
  const [floatingPreview, setFloatingPreview] = useState<{
    slug: string;
    contentKind: QrCode["contentKind"];
    publicUrl: string;
    styleJson: unknown;
    payloadJson: unknown;
    initialBarcodeDataUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    setRows(initialQrs);
  }, [initialQrs]);

  useEffect(() => {
    function onCreated(e: Event) {
      const ce = e as CustomEvent<CyqrCreatedDetail>;
      const d = ce.detail;
      if (!d?.qr?.id) return;

      setRows((prev) => {
        if (prev.some((r) => r.id === d.qr.id)) {
          return prev.map((r) => (r.id === d.qr.id ? { ...r, ...d.qr } : r));
        }
        return [d.qr, ...prev].slice(0, 20);
      });

      requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      if (d.openPreview) {
        setFloatingPreview({
          slug: d.qr.slug,
          contentKind: d.qr.contentKind,
          publicUrl: d.publicUrl,
          styleJson: d.qr.styleJson,
          payloadJson: d.qr.payloadJson,
          initialBarcodeDataUrl: d.imageDataUrl ?? null,
        });
      }
    }

    window.addEventListener("cyqr:created", onCreated);
    return () => window.removeEventListener("cyqr:created", onCreated);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="recent-qr-codes"
      className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Recent QR codes</h2>

      {/* Mobile: stacked cards — no horizontal scroll for actions */}
      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {rows.map((qr) => (
          <article
            key={qr.id}
            className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-zinc-900">{qr.slug}</p>
                <p className="text-xs text-zinc-500">{qr.contentKind}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
                {qr.status}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600">
              <div>
                <dt className="font-medium text-zinc-400">Scans</dt>
                <dd>
                  {qr.scanCount} / {qr.maxScans}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-400">Expires</dt>
                <dd>{new Date(qr.expiresAt).toLocaleDateString()}</dd>
              </div>
            </dl>
            <p className="mt-2 break-words text-xs text-zinc-600">{formatQrDestinationCell(qr)}</p>
            <div className="mt-4 border-t border-zinc-200 pt-3">
              <DashboardQrActions
                slug={qr.slug}
                contentKind={qr.contentKind}
                publicUrl={`${appUrl}/qr/${qr.slug}`}
                styleJson={qr.styleJson}
                payloadJson={qr.payloadJson}
              />
            </div>
          </article>
        ))}
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            No QR codes yet. Create your first one above.
          </p>
        ) : null}
      </div>

      {/* Desktop: wide table */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-600">
              <th className="px-2 py-2">Slug</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Scans</th>
              <th className="px-2 py-2">Expires</th>
              <th className="px-2 py-2">Destination / content</th>
              <th className="px-2 py-2">Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((qr) => (
              <tr key={qr.id} className="border-b border-zinc-100">
                <td className="px-2 py-2 font-medium text-zinc-900">{qr.slug}</td>
                <td className="px-2 py-2 text-zinc-700">{qr.contentKind}</td>
                <td className="px-2 py-2">{qr.status}</td>
                <td className="px-2 py-2">
                  {qr.scanCount} / {qr.maxScans}
                </td>
                <td className="px-2 py-2">{new Date(qr.expiresAt).toLocaleDateString()}</td>
                <td className="max-w-[280px] truncate px-2 py-2 text-zinc-600">
                  {formatQrDestinationCell(qr)}
                </td>
                <td className="px-2 py-2 align-top">
                  <DashboardQrActions
                    slug={qr.slug}
                    contentKind={qr.contentKind}
                    publicUrl={`${appUrl}/qr/${qr.slug}`}
                    styleJson={qr.styleJson}
                    payloadJson={qr.payloadJson}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-5 text-zinc-500">
                  No QR codes yet. Create your first one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {floatingPreview ? (
        <QrPreviewModal
          open
          onClose={() => setFloatingPreview(null)}
          slug={floatingPreview.slug}
          contentKind={floatingPreview.contentKind}
          publicUrl={floatingPreview.publicUrl}
          styleJson={floatingPreview.styleJson}
          payloadJson={floatingPreview.payloadJson}
          initialBarcodeDataUrl={floatingPreview.initialBarcodeDataUrl}
        />
      ) : null}
    </section>
  );
}
