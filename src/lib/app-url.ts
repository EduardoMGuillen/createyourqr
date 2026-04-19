const DEFAULT_APP_URL = "http://localhost:3000";

/**
 * `NEXT_PUBLIC_APP_URL` is often set to a bare host (e.g. `createyourqr.app`) in dashboards.
 * `new URL()` and many APIs require a full origin with scheme — this normalizes safely.
 */
export function normalizeAppBaseUrl(raw: string | undefined): string {
  const s = (raw?.trim() || DEFAULT_APP_URL).trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) {
    return s.replace(/\/+$/, "") || DEFAULT_APP_URL;
  }
  if (/^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(s)) {
    return `http://${s}`.replace(/\/+$/, "");
  }
  return `https://${s}`.replace(/\/+$/, "");
}

/** Canonical site origin (no trailing slash). */
export const appUrl = normalizeAppBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
