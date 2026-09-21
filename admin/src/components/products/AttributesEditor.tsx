'use client';

import { useState } from 'react';

type Row = { key: string; value: string };

function toRows(value: Record<string, unknown> | null | undefined): Row[] {
  if (!value) return [];
  return Object.entries(value).map(([key, v]) => ({
    key,
    value: Array.isArray(v) ? v.join(', ') : String(v ?? ''),
  }));
}

function toAttributes(rows: Row[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    result[key] = row.value.includes(',')
      ? row.value.split(',').map((v) => v.trim()).filter(Boolean)
      : row.value;
  }
  return result;
}

export function AttributesEditor({
  initial,
  onChange,
}: {
  initial?: Record<string, unknown> | null;
  onChange: (attributes: Record<string, unknown>) => void;
}) {
  const [rows, setRows] = useState<Row[]>(toRows(initial));

  function update(next: Row[]) {
    setRows(next);
    onChange(toAttributes(next));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--heading)]">
          Attributes <span className="font-normal text-[var(--muted)]">(e.g. stoneType, chakra, zodiac — comma-separate multi-values)</span>
        </label>
        <button
          type="button"
          onClick={() => update([...rows, { key: '', value: '' }])}
          className="text-sm font-semibold text-[var(--brand)]"
        >
          + Add attribute
        </button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <input
            placeholder="key"
            value={row.key}
            onChange={(e) =>
              update(rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)))
            }
            className="w-1/3 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
          <input
            placeholder="value"
            value={row.value}
            onChange={(e) =>
              update(rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))
            }
            className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => update(rows.filter((_, i) => i !== index))}
            className="px-2 text-sm font-semibold text-[var(--danger)]"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
