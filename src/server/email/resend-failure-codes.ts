/** Safe codes we expose to the client when Resend rejects an email (no raw API text). */
export type ResendEmailFailureCode =
  | "missing_api_key"
  | "invalid_sender"
  | "quota"
  | "rate_limit"
  | "validation"
  | "missing_or_invalid_key"
  | "unknown";

/** Map Resend API `error.name` to a stable code for UI and support. */
export function mapResendErrorName(name: string | undefined): ResendEmailFailureCode {
  switch (name) {
    case "invalid_from_address":
      return "invalid_sender";
    case "monthly_quota_exceeded":
    case "daily_quota_exceeded":
      return "quota";
    case "rate_limit_exceeded":
      return "rate_limit";
    case "validation_error":
    case "missing_required_field":
    case "invalid_parameter":
      return "validation";
    case "missing_api_key":
    case "invalid_api_key":
    case "restricted_api_key":
      return "missing_or_invalid_key";
    default:
      return "unknown";
  }
}
