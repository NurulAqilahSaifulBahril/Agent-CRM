// "MR CHING FRIEND" -> "Mr Ching Friend"; also capitalises after - and '.
export function toNameCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}
