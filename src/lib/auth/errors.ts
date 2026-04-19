const messages: Record<string, string> = {
  Configuration:
    "Sign-in is misconfigured. Check NEXTAUTH_URL, NEXTAUTH_SECRET, and Google OAuth credentials on the server.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid. Request a new one.",
  OAuthSignin: "Could not start Google sign-in. Try again.",
  OAuthCallback: "Google sign-in failed after redirect. Check redirect URIs in Google Cloud Console.",
  OAuthCreateAccount: "Could not create your account with Google.",
  EmailCreateAccount: "Could not create your account with email.",
  Callback: "Something went wrong during sign-in.",
  OAuthAccountNotLinked:
    "This email is already used with another sign-in method. Try email and password, or contact support.",
  SessionRequired: "You must be signed in to view this page.",
  Default: "Sign-in failed. Please try again.",
};

export function getAuthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return messages[code] ?? messages.Default;
}
