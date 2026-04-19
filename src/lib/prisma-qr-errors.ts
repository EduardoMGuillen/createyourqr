/** Detects DB/Prisma errors when the `styleJson` column is missing (migration not applied). */
export function isMissingStyleJsonColumn(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  if (!/styleJson/i.test(msg)) return false;
  return (
    /does not exist|not exist in the current database|42703|no such column/i.test(msg) ||
    /column .*styleJson/i.test(msg)
  );
}
