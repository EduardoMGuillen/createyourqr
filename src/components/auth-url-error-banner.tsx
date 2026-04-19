"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { getAuthErrorMessage } from "@/lib/auth/errors";

export function AuthUrlErrorBanner() {
  const searchParams = useSearchParams();
  const message = useMemo(
    () => getAuthErrorMessage(searchParams.get("error")),
    [searchParams],
  );

  if (!message) {
    return null;
  }

  return (
    <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {message}
    </p>
  );
}
