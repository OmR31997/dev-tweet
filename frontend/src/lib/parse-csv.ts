/** Parse CSV text into rows (handles quoted fields and commas). */
export function parseCsv(text: string, maxRows = 100): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    if (row.length > 0 || cell.length > 0) {
      pushCell();
      rows.push(row);
      row = [];
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      pushCell();
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      pushRow();
      if (rows.length >= maxRows) break;
      continue;
    }

    cell += char;
  }

  if (rows.length < maxRows && (cell.length > 0 || row.length > 0)) {
    pushRow();
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}
