/**
 * Helper to extract initials from user's first name and first surname.
 * Example: "Sophia Benett" -> "SB", "Dra. Isabella Foster" -> "IF"
 */
export function getFirstAndSurnameInitials(name: string): string {
  if (!name || typeof name !== "string") return "U";

  // Strip academic / professional titles
  const cleanName = name
    .replace(/^(Dra?\.|Me\.|Ma\.|Prof\.|Profa\.|Eng\.|Sr\.|Sra\.)\s+/i, "")
    .trim();

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  const firstNameInitial = parts[0][0];
  const firstSurnameInitial = parts[1][0];

  return (firstNameInitial + firstSurnameInitial).toUpperCase();
}
