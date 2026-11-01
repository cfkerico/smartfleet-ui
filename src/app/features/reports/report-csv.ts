export function createCsv(headers: string[], rows: (string | number)[][]): string {
  const quote = (value: string | number) => {
    const safe = typeof value === 'string' && /^[\s]*[=+@-]/.test(value) ? `'${value}` : String(value);
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [headers, ...rows].map(row => row.map(quote).join(';')).join('\r\n') + '\r\n';
}

export function downloadCsv(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
