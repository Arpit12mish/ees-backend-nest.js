import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';
import { getProductReviews } from '@/lib/api/reviews.api';

export async function ReviewsSection({ productSlug }: { productSlug: string }) {
  const data = await getProductReviews(productSlug).catch(() => null);
  const reviews = data?.items ?? [];

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#17201d]">
        Customer reviews {reviews.length ? `(${reviews.length})` : ''}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-[var(--border)] pb-4 last:border-0">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                {review.isVerifiedPurchase ? (
                  <span className="text-xs font-semibold text-[var(--brand)]">
                    Verified purchase
                  </span>
                ) : null}
              </div>
              {review.title ? (
                <p className="mt-2 font-semibold text-[#17201d]">{review.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{review.comment}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {review.customerName} ·{' '}
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[#17201d]">Write a review</h3>
        <div className="mt-3">
          <ReviewForm productSlug={productSlug} />
        </div>
      </div>
    </section>
  );
}
