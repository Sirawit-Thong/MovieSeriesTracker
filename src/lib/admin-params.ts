export function parsePageParam(value: string | null): number | null {
  if (value === null || value === '') return 1;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 100000) return null;
  return n;
}
