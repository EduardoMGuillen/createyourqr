"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DemoLink = {
  id: string;
  label: string;
  url: string;
};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function LinkInBioLiveDemo() {
  const [title, setTitle] = useState("Creator Name");
  const [subtitle, setSubtitle] = useState("Content, launches, and social links");
  const [links, setLinks] = useState<DemoLink[]>([
    { id: createId(), label: "Watch latest video", url: "youtube.com/@creator" },
    { id: createId(), label: "Shop my templates", url: "example.com/shop" },
    { id: createId(), label: "Book a call", url: "cal.com/creator" },
  ]);

  const validLinks = useMemo(
    () => links.filter((item) => item.label.trim().length > 0 && item.url.trim().length > 0),
    [links],
  );

  return (
    <section className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg shadow-zinc-900/5 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Live link-in-bio demo</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Edit fields on the left and watch your bio page preview update instantly.
          </p>

          <div className="mt-5 space-y-3">
            <div>
              <label htmlFor="bio-title" className="text-sm font-medium text-zinc-800">
                Page title
              </label>
              <input
                id="bio-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="bio-subtitle" className="text-sm font-medium text-zinc-800">
                Subtitle
              </label>
              <input
                id="bio-subtitle"
                type="text"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            {links.map((item, index) => (
              <div key={item.id} className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((l) => (l.id === item.id ? { ...l, label: event.target.value } : l)),
                    )
                  }
                  placeholder={`Button ${index + 1} label`}
                  className="rounded-md border border-zinc-300 px-2.5 py-2 text-sm"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((l) => (l.id === item.id ? { ...l, url: event.target.value } : l)),
                    )
                  }
                  placeholder="your-link.com"
                  className="rounded-md border border-zinc-300 px-2.5 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/register?from=link-in-bio"
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Create account and save this page
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              View Pro options
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preview</p>
          <div className="mt-2 rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-900 to-zinc-800 p-4 text-white">
            <div className="rounded-2xl bg-zinc-950/50 p-4">
              <p className="text-center text-lg font-semibold">{title || "Creator Name"}</p>
              <p className="mt-1 text-center text-xs text-zinc-300">
                {subtitle || "Content, launches, and social links"}
              </p>
              <div className="mt-4 space-y-2">
                {validLinks.length > 0 ? (
                  validLinks.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-center text-sm"
                    >
                      {item.label}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-zinc-400">Add at least one button.</p>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            This is a conversion-focused preview. Full publishing and analytics are available after signup.
          </p>
        </div>
      </div>
    </section>
  );
}
