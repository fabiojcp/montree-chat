export function sanitizeInput(
  text: string,
  maxLength: number,
): string {
  let sanitized = text.trim();

  sanitized = sanitized.replace(/<[^>]*>/g, "");

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
