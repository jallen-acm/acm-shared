// Display formatting shared by every ACM client.

export function money(value) {
  if (value === undefined || value === null) return '—';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function shortDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US');
}
