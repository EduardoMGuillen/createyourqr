import { z } from "zod";

export const destinationUrlSchema = z.url().refine((value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}, "Only HTTP/HTTPS URLs are supported.");
