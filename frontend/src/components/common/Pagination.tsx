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
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-3"
    >
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[#17201d] hover:border-[var(--brand)]"
        >
          Previous
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted)] opacity-40">
          Previous
        </span>
      )}

      <span className="text-sm text-[var(--muted)]">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[#17201d] hover:border-[var(--brand)]"
        >
          Next
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted)] opacity-40">
          Next
        </span>
      )}
    </nav>
  );
}
