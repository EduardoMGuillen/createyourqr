"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

import type { QrStyleV1 } from "@/lib/validators";

function buildOptions(style: QrStyleV1, data: string, size: number) {
  const logo = style.logoDataUrl ?? undefined;
  return {
    width: size,
    height: size,
    type: "canvas" as const,
    data,
    margin: 6,
    qrOptions: {
      errorCorrectionLevel: logo ? ("H" as const) : ("M" as const),
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 4,
    },
    dotsOptions: {
      type: style.dotsType,
      color: style.fg,
    },
    cornersSquareOptions: {
      type: style.cornersSquareType,
      color: style.fg,
    },
    cornersDotOptions: {
      type: style.cornersDotType,
      color: style.fg,
    },
    backgroundOptions: {
      color: style.bg,
    },
    image: logo,
  };
}

type QrStylePreviewProps = {
  data: string;
  style: QrStyleV1;
  size?: number;
  className?: string;
};

export function QrStylePreview({
  data,
  style,
  size = 220,
  className = "",
}: QrStylePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<QRCodeStyling | null>(null);
  const styleKey = JSON.stringify(style);

  // `styleKey` tracks visual options even when the parent recreates the `style` object.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const timer = window.setTimeout(() => {
      if (!instanceRef.current) {
        instanceRef.current = new QRCodeStyling(buildOptions(style, data, size));
        instanceRef.current.append(el);
      } else {
        instanceRef.current.update(buildOptions(style, data, size));
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, styleKey, size, style]);

  useEffect(() => {
    const el = containerRef.current;
    return () => {
      el?.replaceChildren();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-3 ${className}`}
    />
  );
}
