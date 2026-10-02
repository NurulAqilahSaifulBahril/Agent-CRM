const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatShortDate(value) {
  const date = new Date(value);
  const text = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === new Date().getFullYear() ? text : `${text} ${date.getFullYear()}`;
}

// A duration in ms as "45m", "3h", "2d" or "2d 4h".
export function formatWait(ms) {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return days < 7 && rest ? `${days}d ${rest}h` : `${days}d`;
}

export function formatAgo(value) {
  if (!value) return "—";
  return `${formatWait(Date.now() - new Date(value).getTime())} ago`;
}

// Recent activity reads "5m ago"; anything older than a day reads "12 Mar".
export function formatWhen(value) {
  const age = Date.now() - new Date(value).getTime();
  if (age < 60000) return "just now";
  return age < 24 * 60 * 60 * 1000 ? formatAgo(value) : formatShortDate(value);
}
