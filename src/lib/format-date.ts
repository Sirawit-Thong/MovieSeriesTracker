export function formatDate(
  date: string | Date | null | undefined,
  locale: string,
): string {
  if (date === null || date === undefined) return '—';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}