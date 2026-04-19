"use client";

import type { ReactNode } from "react";
import { QrContentKind } from "@prisma/client";

type ContentKindPickerProps = {
  value: QrContentKind;
  onChange: (kind: QrContentKind) => void;
};

const items: {
  kind: QrContentKind;
  label: string;
  hint: string;
  icon: () => ReactNode;
}[] = [
  {
    kind: QrContentKind.URL,
    label: "Website",
    hint: "URL redirect",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M10 13a5 5 0 0 1 7.07 0M14 11a5 5 0 0 0-7.07 0" strokeLinecap="round" />
        <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.EMAIL,
    label: "Email",
    hint: "mailto",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.PHONE,
    label: "Phone",
    hint: "tel:",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M8 3h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2h-1C8.82 19 3 13.18 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.SMS,
    label: "SMS",
    hint: "Text link",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 5h16v12H8l-4 3V5Z" strokeLinejoin="round" />
        <path d="M8 10h8M8 13h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.TEXT,
    label: "Text",
    hint: "Simple page",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M6 6h12M6 10h12M6 14h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.WIFI,
    label: "Wi‑Fi",
    hint: "Join helper",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M5 9a12 12 0 0 1 14 0M8.5 12.5a7 7 0 0 1 7 0M12 16h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.LINK_PAGE,
    label: "Link page",
    hint: "Link-in-bio",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="16" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    kind: QrContentKind.BARCODE,
    label: "Barcode",
    hint: "Static image",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <rect x="4" y="4" width="2" height="16" rx="0.5" />
        <rect x="8" y="4" width="1.2" height="16" rx="0.5" />
        <rect x="11" y="4" width="2.5" height="16" rx="0.5" />
        <rect x="15" y="4" width="1" height="16" rx="0.5" />
        <rect x="18" y="4" width="2" height="16" rx="0.5" />
      </svg>
    ),
  },
];

export function ContentKindPicker({ value, onChange }: ContentKindPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Content type"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-4"
    >
      {items.map((item) => {
        const active = value === item.kind;
        return (
          <button
            key={item.kind}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.kind)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
              active
                ? "border-violet-500 bg-violet-50 text-violet-900 shadow-sm ring-1 ring-violet-500/20"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <span className={active ? "text-violet-600" : "text-zinc-500"}>{item.icon()}</span>
            <span className="text-xs font-semibold leading-tight">{item.label}</span>
            <span className="text-[10px] font-medium leading-tight text-zinc-400">{item.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
