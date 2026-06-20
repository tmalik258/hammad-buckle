/**
 * Derive 1–2 character initials from a display name or email fallback.
 */
export function getUserInitials(
  name?: string | null,
  email?: string | null
): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return trimmedName.slice(0, 2).toUpperCase();
  }

  const trimmedEmail = email?.trim();
  if (trimmedEmail) {
    return trimmedEmail.charAt(0).toUpperCase();
  }

  return "U";
}
