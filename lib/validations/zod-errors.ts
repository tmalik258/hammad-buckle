import type { ZodError } from "zod";

export function formatZodError(error: ZodError): string {
  const first = error.issues[0];
  if (!first) return "Validation failed";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
