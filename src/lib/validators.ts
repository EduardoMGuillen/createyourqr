import { z } from "zod";

export const destinationUrlSchema = z.url().refine((value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}, "Only HTTP/HTTPS URLs are supported.");

/** Trim and prefix https:// when the user omits the scheme (fixes HTML5 type=url strictness). */
export function normalizeDestinationUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const destinationUrlInputSchema = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Please enter a URL." })
  .transform(normalizeDestinationUrl)
  .pipe(destinationUrlSchema);

function normalizeHex6(input: string) {
  const s = input.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const [, r, g, b] = s;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return s.toLowerCase();
}

const hexColor = z
  .string()
  .transform(normalizeHex6)
  .pipe(z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colors must be #RRGGBB."));

const dotType = z.enum([
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "square",
  "extra-rounded",
]);

const cornerSquareType = z.enum([
  "dot",
  "square",
  "extra-rounded",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
]);

const cornerDotType = z.enum([
  "dot",
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
]);

/** Versioned visual-only QR options (stored as JSON). Logo is optional data URL, capped in superRefine. */
export const qrStyleV1Schema = z.object({
  v: z.literal(1),
  fg: hexColor,
  bg: hexColor,
  dotsType: dotType,
  cornersSquareType: cornerSquareType,
  cornersDotType: cornerDotType,
  logoDataUrl: z.string().nullable().optional(),
});

export type QrStyleV1 = z.infer<typeof qrStyleV1Schema>;

const MAX_STYLE_JSON_CHARS = 280_000;
const MAX_LOGO_DATA_URL_CHARS = 240_000;

export const qrStyleJsonSchema = qrStyleV1Schema
  .optional()
  .superRefine((val, ctx) => {
    if (!val) return;
    const json = JSON.stringify(val);
    if (json.length > MAX_STYLE_JSON_CHARS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Style payload is too large.",
      });
    }
    if (val.logoDataUrl && val.logoDataUrl.length > MAX_LOGO_DATA_URL_CHARS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Logo image is too large (max ~200KB).",
        path: ["logoDataUrl"],
      });
    }
  });

export const createQrBodySchema = z.object({
  destinationUrl: destinationUrlInputSchema,
  styleJson: qrStyleJsonSchema,
});

export const patchQrBodySchema = z
  .object({
    destinationUrl: destinationUrlInputSchema.optional(),
    disabled: z.boolean().optional(),
    styleJson: qrStyleJsonSchema,
  })
  .refine(
    (d) =>
      d.destinationUrl !== undefined ||
      d.disabled !== undefined ||
      d.styleJson !== undefined,
    { message: "Nothing to update." },
  );
