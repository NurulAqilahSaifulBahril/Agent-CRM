export function toWhatsAppLink(phone) {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("0") ? "60" + digits.slice(1) : digits;
  return `https://wa.me/${withCountryCode}`;
}
