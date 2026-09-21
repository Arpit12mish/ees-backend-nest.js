export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      className="inline-flex items-center gap-0.5 text-[var(--accent)]"
      style={{ fontSize: size }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < rounded ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
