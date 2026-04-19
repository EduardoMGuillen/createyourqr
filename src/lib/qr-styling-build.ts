import type { Options } from "qr-code-styling";
import type { QrStyleV1 } from "@/lib/validators";

export function buildQrCodeStylingOptions(
  style: QrStyleV1,
  data: string,
  size: number,
): Partial<Options> {
  const logo = style.logoDataUrl ?? undefined;
  return {
    width: size,
    height: size,
    type: "canvas",
    data,
    margin: 6,
    qrOptions: {
      errorCorrectionLevel: logo ? "H" : "M",
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
