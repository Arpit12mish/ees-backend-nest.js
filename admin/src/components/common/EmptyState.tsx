export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-white p-6 text-center">
      <p className="font-semibold text-[var(--heading)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}
