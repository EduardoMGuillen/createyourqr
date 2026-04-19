import { NextResponse } from "next/server";

import { getUpgradeUrl, trackScanAndResolve } from "@/server/qr-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const result = await trackScanAndResolve(slug, request);

  if (!result.found) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  if (result.status === "ACTIVE") {
    return NextResponse.redirect(result.qr.destinationUrl, 302);
  }

  return NextResponse.redirect(getUpgradeUrl(slug), 302);
}
