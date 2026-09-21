export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm">
      <p className="font-semibold text-[var(--danger)]">{title}</p>
      <p className="mt-1 text-[var(--danger)]">{description}</p>
    </div>
  );
}
