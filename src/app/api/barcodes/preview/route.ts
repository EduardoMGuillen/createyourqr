import { NextResponse } from "next/server";
import { z } from "zod";

import { renderBarcodePngDataUrl } from "@/lib/barcode";
import { getCurrentSession } from "@/lib/auth/session";
import { barcodePayloadSchema, barcodeSymbologySchema } from "@/lib/validators";

const previewBodySchema = z.object({
  symbology: barcodeSymbologySchema,
  data: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = previewBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const full = barcodePayloadSchema.safeParse({
    v: 1,
    symbology: parsed.data.symbology,
    data: parsed.data.data,
  });
  if (!full.success) {
    const first = full.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid barcode data." },
      { status: 400 },
    );
  }

  try {
    const imageDataUrl = await renderBarcodePngDataUrl(full.data);
    return NextResponse.json({ imageDataUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not render barcode.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
