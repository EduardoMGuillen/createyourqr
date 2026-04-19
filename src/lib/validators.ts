import { QrContentKind } from "@prisma/client";
import { z } from "zod";

import { buildWifiString } from "@/lib/qr-content";

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

/** Default module look when `styleJson` is missing or invalid (e.g. legacy rows). */
export const DEFAULT_QR_STYLE_V1: QrStyleV1 = {
  v: 1,
  fg: "#0a0a0a",
  bg: "#ffffff",
  dotsType: "rounded",
  cornersSquareType: "extra-rounded",
  cornersDotType: "dot",
  logoDataUrl: null,
};

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

const e164Schema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, "Use international format (e.g. +34600123456).");

export const emailPayloadSchema = z.object({
  v: z.literal(1),
  email: z.string().trim().email().max(254),
  subject: z.string().max(200).optional(),
  body: z.string().max(4000).optional(),
});

export const phonePayloadSchema = z.object({
  v: z.literal(1),
  e164: e164Schema,
});

export const smsPayloadSchema = z.object({
  v: z.literal(1),
  e164: e164Schema,
  body: z.string().max(900).optional(),
});

export const textPayloadSchema = z.object({
  v: z.literal(1),
  text: z.string().max(4096),
});

export const barcodeSymbologySchema = z.enum([
  "CODE128",
  "CODE39",
  "EAN13",
  "UPCA",
  "ITF14",
]);

export const barcodePayloadSchema = z
  .object({
    v: z.literal(1),
    symbology: barcodeSymbologySchema,
    data: z
      .string()
      .min(1)
      .max(80)
      .transform((s) => s.trim()),
  })
  .superRefine((val, ctx) => {
    const d = val.data;
    if (val.symbology === "EAN13") {
      if (!/^\d{12,13}$/.test(d)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "EAN-13 must be 12 or 13 digits.",
          path: ["data"],
        });
      }
    }
    if (val.symbology === "UPCA") {
      if (!/^\d{11,12}$/.test(d)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "UPC-A must be 11 or 12 digits.",
          path: ["data"],
        });
      }
    }
    if (val.symbology === "ITF14") {
      if (!/^\d{13,14}$/.test(d)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ITF-14 must be 13 or 14 digits.",
          path: ["data"],
        });
      }
    }
    if (val.symbology === "CODE39") {
      if (d.length > 48) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CODE39 supports at most 48 characters.",
          path: ["data"],
        });
      }
      if (!/^[0-9A-Z $./+%-]+$/.test(d)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CODE39 allows only 0-9, A-Z, space, and . $ / + % -.",
          path: ["data"],
        });
      }
    }
  });

/** One outbound link on a link-in-bio page (HTTP/HTTPS only). */
export const linkHubItemSchema = z.object({
  label: z.string().trim().min(1).max(56),
  url: destinationUrlInputSchema,
});

export const linkPageThemeSchema = z.object({
  v: z.literal(1),
  pageBg: hexColor,
  pageText: hexColor,
  cardBg: hexColor,
  cardText: hexColor,
  accent: hexColor,
  buttonRadius: z.enum(["sm", "md", "full"]),
});

export const linkPagePayloadSchema = z.object({
  v: z.literal(1),
  title: z.string().trim().min(1).max(64),
  subtitle: z.string().trim().max(200).optional(),
  links: z.array(linkHubItemSchema).min(1).max(16),
  theme: linkPageThemeSchema.optional(),
});

export const wifiPayloadSchema = z
  .object({
    v: z.literal(1),
    ssid: z.string().min(1).max(32),
    password: z.string().max(63).optional(),
    encryption: z.enum(["WPA", "WEP", "nopass"]),
  })
  .superRefine((val, ctx) => {
    if (val.encryption !== "nopass" && (!val.password || val.password.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required for WPA/WEP.",
        path: ["password"],
      });
    }
    const built = buildWifiString({
      v: 1,
      ssid: val.ssid,
      password: val.password,
      encryption: val.encryption,
    });
    if (built.length > 1500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wi‑Fi data is too long for a reliable QR payload.",
      });
    }
  });

export type EmailPayloadV1 = z.infer<typeof emailPayloadSchema>;
export type PhonePayloadV1 = z.infer<typeof phonePayloadSchema>;
export type SmsPayloadV1 = z.infer<typeof smsPayloadSchema>;
export type TextPayloadV1 = z.infer<typeof textPayloadSchema>;
export type WifiPayloadV1 = z.infer<typeof wifiPayloadSchema>;
export type BarcodePayloadV1 = z.infer<typeof barcodePayloadSchema>;
export type LinkPagePayloadV1 = z.infer<typeof linkPagePayloadSchema>;
export type LinkPageThemeV1 = z.infer<typeof linkPageThemeSchema>;

export const qrContentKindSchema = z.nativeEnum(QrContentKind);

const createQrDiscriminated = z.discriminatedUnion("contentKind", [
  z.object({
    contentKind: z.literal(QrContentKind.URL),
    destinationUrl: destinationUrlInputSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.EMAIL),
    payloadJson: emailPayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.PHONE),
    payloadJson: phonePayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.SMS),
    payloadJson: smsPayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.TEXT),
    payloadJson: textPayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.WIFI),
    payloadJson: wifiPayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.LINK_PAGE),
    payloadJson: linkPagePayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
  z.object({
    contentKind: z.literal(QrContentKind.BARCODE),
    payloadJson: barcodePayloadSchema,
    styleJson: qrStyleJsonSchema,
  }),
]);

/** Accepts legacy bodies without `contentKind` (treated as URL). */
export const createQrBodySchema = z.preprocess((raw) => {
  if (raw && typeof raw === "object" && raw !== null && !("contentKind" in raw)) {
    return { ...raw, contentKind: QrContentKind.URL };
  }
  return raw;
}, createQrDiscriminated);

export type CreateQrBody = z.infer<typeof createQrBodySchema>;

const patchDestinationUrlSchema = z
  .union([
    z.literal(null),
    z
      .string()
      .trim()
      .refine((s) => s.length > 0, { message: "Please enter a URL." })
      .transform(normalizeDestinationUrl)
      .pipe(destinationUrlSchema),
  ])
  .optional();

export const patchQrBodySchema = z
  .object({
    contentKind: qrContentKindSchema.optional(),
    destinationUrl: patchDestinationUrlSchema,
    payloadJson: z.unknown().optional(),
    disabled: z.boolean().optional(),
    styleJson: qrStyleJsonSchema,
  })
  .refine(
    (d) =>
      d.contentKind !== undefined ||
      d.destinationUrl !== undefined ||
      d.payloadJson !== undefined ||
      d.disabled !== undefined ||
      d.styleJson !== undefined,
    { message: "Nothing to update." },
  );

export type PatchQrBody = z.infer<typeof patchQrBodySchema>;

export type MergedQrWrite =
  | {
      contentKind: typeof QrContentKind.URL;
      destinationUrl: string;
      payloadJson: null;
    }
  | {
      contentKind: typeof QrContentKind.EMAIL;
      destinationUrl: null;
      payloadJson: EmailPayloadV1;
    }
  | {
      contentKind: typeof QrContentKind.PHONE;
      destinationUrl: null;
      payloadJson: PhonePayloadV1;
    }
  | {
      contentKind: typeof QrContentKind.SMS;
      destinationUrl: null;
      payloadJson: SmsPayloadV1;
    }
  | {
      contentKind: typeof QrContentKind.TEXT;
      destinationUrl: null;
      payloadJson: TextPayloadV1;
    }
  | {
      contentKind: typeof QrContentKind.WIFI;
      destinationUrl: null;
      payloadJson: WifiPayloadV1;
    }
  | {
      contentKind: typeof QrContentKind.BARCODE;
      destinationUrl: null;
      payloadJson: BarcodePayloadV1;
    }
  | {
      contentKind: typeof QrContentKind.LINK_PAGE;
      destinationUrl: null;
      payloadJson: LinkPagePayloadV1;
    };

export function parseMergedQrWrite(input: {
  contentKind: QrContentKind;
  destinationUrl: string | null;
  payloadJson: unknown;
}):
  | { ok: true; value: MergedQrWrite }
  | { ok: false; error: z.ZodError } {
  switch (input.contentKind) {
    case QrContentKind.URL: {
      const parsed = z
        .object({ destinationUrl: destinationUrlInputSchema })
        .safeParse({ destinationUrl: input.destinationUrl });
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.URL,
          destinationUrl: parsed.data.destinationUrl,
          payloadJson: null,
        },
      };
    }
    case QrContentKind.EMAIL: {
      const parsed = emailPayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.EMAIL,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    case QrContentKind.PHONE: {
      const parsed = phonePayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.PHONE,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    case QrContentKind.SMS: {
      const parsed = smsPayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.SMS,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    case QrContentKind.TEXT: {
      const parsed = textPayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.TEXT,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    case QrContentKind.WIFI: {
      const parsed = wifiPayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.WIFI,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    case QrContentKind.BARCODE: {
      const parsed = barcodePayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.BARCODE,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    case QrContentKind.LINK_PAGE: {
      const parsed = linkPagePayloadSchema.safeParse(input.payloadJson);
      if (!parsed.success) return { ok: false, error: parsed.error };
      return {
        ok: true,
        value: {
          contentKind: QrContentKind.LINK_PAGE,
          destinationUrl: null,
          payloadJson: parsed.data,
        },
      };
    }
    default: {
      return {
        ok: false,
        error: new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "Unknown content kind.",
            path: ["contentKind"],
          },
        ]),
      };
    }
  }
}
