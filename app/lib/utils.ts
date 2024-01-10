export function formatDate(date: Date) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: timezone,
  }).format(date);
}
