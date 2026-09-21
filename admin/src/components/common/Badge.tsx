const TONE_CLASSES = {
  neutral: 'bg-[var(--soft)] text-[var(--heading)]',
  brand: 'bg-[var(--brand)]/10 text-[var(--brand-dark)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  warning: 'bg-amber-100 text-amber-800',
} as const;

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
