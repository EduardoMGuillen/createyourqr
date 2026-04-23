"use client";

import { useEffect, useId, useMemo, useState } from "react";

type LocaleOption = {
  value: "en" | "es" | "fr" | "pt";
  label: string;
};

const STORAGE_KEY = "cyqr-locale";
const localeOptions: LocaleOption[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
];

function applyGoogleLocale(locale: LocaleOption["value"]) {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return;
  combo.value = locale;
  combo.dispatchEvent(new Event("change"));
}

function mountGoogleTranslateWidget(onReady: () => void) {
  if (typeof window === "undefined") return;
  const host = document.getElementById("google_translate_element");
  if (!host) return;
  const ExistingTranslateElement = window.google?.translate?.TranslateElement;
  if (ExistingTranslateElement) {
    if (!host.childElementCount) {
      new ExistingTranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,fr,pt",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    }
    onReady();
    return;
  }

  window.googleTranslateElementInit = () => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    if (!TranslateElement) return;
    new TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,es,fr,pt",
        autoDisplay: false,
      },
      "google_translate_element",
    );
    onReady();
  };

  if (!document.getElementById("google-translate-script")) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
          },
          elementId: string,
        ) => unknown;
      };
    };
  }
}

export function LanguageSelector() {
  const [locale, setLocale] = useState<LocaleOption["value"]>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(STORAGE_KEY) as LocaleOption["value"] | null;
    return saved && localeOptions.some((option) => option.value === saved) ? saved : "en";
  });
  const selectId = useId();

  const activeOption = useMemo(
    () => localeOptions.find((option) => option.value === locale) ?? localeOptions[0],
    [locale],
  );

  useEffect(() => {
    let canceled = false;
    mountGoogleTranslateWidget(() => {
      if (canceled) return;
      setTimeout(() => applyGoogleLocale(locale), 120);
    });

    return () => {
      canceled = true;
    };
  }, [locale]);

  return (
    <>
      <label className="sr-only" htmlFor={selectId}>
        Language
      </label>
      <select
        id={selectId}
        value={activeOption.value}
        onChange={(event) => {
          const nextLocale = event.target.value as LocaleOption["value"];
          setLocale(nextLocale);
          localStorage.setItem(STORAGE_KEY, nextLocale);
          applyGoogleLocale(nextLocale);
        }}
        className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
