const COMMON = new Set([
  "password",
  "12345678",
  "qwerty",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
]);

export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export type PasswordStrengthResult = {
  level: PasswordStrengthLevel;
  score: number;
  suggestions: string[];
};

function hasRepeatingPattern(password: string) {
  return /(.)\1{3,}/.test(password);
}

/** Heuristic meter (0–3) with short UX hints; not a substitute for server rules. */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const suggestions: string[] = [];
  let points = 0;

  const len = password.length;
  if (len >= 8) points += 1;
  else suggestions.push("Use at least 8 characters.");
  if (len >= 12) points += 1;
  else if (len >= 8) suggestions.push("Use at least 12 characters for a stronger password.");

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasLower && hasUpper) points += 1;
  else {
    if (!hasLower) suggestions.push("Add lowercase letters.");
    if (!hasUpper) suggestions.push("Add uppercase letters.");
  }

  if (hasDigit) points += 1;
  else suggestions.push("Add a number.");

  if (hasSymbol) points += 1;
  else suggestions.push("Add a symbol (e.g. !, @, #).");

  const lower = password.toLowerCase();
  if (COMMON.has(lower)) {
    points = Math.min(points, 1);
    suggestions.push("Avoid very common passwords.");
  }
  if (hasRepeatingPattern(password)) {
    points = Math.max(0, points - 1);
    suggestions.push("Avoid long repeated characters.");
  }

  const capped = Math.min(3, Math.max(0, Math.floor(points / 2)));
  const level: PasswordStrengthLevel =
    capped === 0 ? "weak" : capped === 1 ? "fair" : capped === 2 ? "good" : "strong";

  const unique = Array.from(new Set(suggestions)).slice(0, 4);

  return { level, score: capped, suggestions: unique };
}
