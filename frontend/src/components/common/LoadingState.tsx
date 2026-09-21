export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
      {label}
    </div>
  );
}
