// WhatsApp deep links only (wa.me). No WhatsApp API, no server-side sending.

/**
 * Normalise a phone number to WhatsApp's international digits-only form (no "+", spaces or punctuation).
 * - "+974 5555 1234", "00974 55551234", "97455551234" → "97455551234"
 * - A bare 8-digit number starting with 3-7 is treated as a Qatar number (the firm and its form are Qatar-based).
 * - Anything else that does not clearly carry a country code is rejected rather than guessed.
 */
export function normalizeWhatsAppPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!/^[+\d\s\-().]+$/.test(raw)) return null;
  const explicitInternational = raw.startsWith("+") || raw.replace(/\D/g, "").startsWith("00");
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!explicitInternational && digits.length === 8 && /^[3-7]/.test(digits)) digits = `974${digits}`;
  else if (!explicitInternational && digits.length < 10) return null; // too short to contain a country code
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) throw new Error("invalid whatsapp number");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
