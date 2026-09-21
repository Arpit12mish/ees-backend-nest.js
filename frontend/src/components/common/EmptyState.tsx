export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-white p-6 text-center">
      <h3 className="text-base font-semibold text-[#17201d]">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}
