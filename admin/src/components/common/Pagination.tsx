import Link from 'next/link';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="min-h-11 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]"
        >
          Previous
        </Link>
      ) : (
        <span className="min-h-11 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--heading)] opacity-40">
          Previous
        </span>
      )}
      <span className="text-sm text-[var(--muted)]">
        Page {page} of {totalPages}
      </span>
      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="min-h-11 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]"
        >
          Next
        </Link>
      ) : (
        <span className="min-h-11 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--heading)] opacity-40">
          Next
        </span>
      )}
    </div>
  );
}
