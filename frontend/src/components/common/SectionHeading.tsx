export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-3xl sm:mb-8">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold leading-tight text-[#17201d] sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
