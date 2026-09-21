'use client';

import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import type { Review } from '@/lib/types/review.types';

export function ReviewsTable({
  reviews,
  approveAction,
  rejectAction,
  deleteAction,
}: {
  reviews: Review[];
  approveAction: (formData: FormData) => void | Promise<void>;
  rejectAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const { query, setQuery, filtered } = useClientFilter(reviews, (r) => [
    r.customerName,
    r.customerEmail,
    r.product?.name ?? '',
    r.comment,
  ]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search reviews…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={reviews.length === 0 ? 'No reviews yet' : 'No matches'}
          description={reviews.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">
                    {review.product?.name ?? review.productId}
                  </td>
                  <td className="px-4 py-3">{'★'.repeat(review.rating)}</td>
                  <td className="px-4 py-3">
                    <div>{review.customerName}</div>
                    <div className="text-xs text-[var(--muted)]">{review.customerEmail}</div>
                    {review.isVerifiedPurchase ? (
                      <Badge tone="brand">Verified purchase</Badge>
                    ) : null}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-[var(--muted)]">
                    {review.title ? <p className="font-semibold text-[var(--heading)]">{review.title}</p> : null}
                    <p className="line-clamp-3">{review.comment}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={review.isApproved ? 'brand' : 'warning'}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <RoleGate permission="reviews.write">
                        {review.isApproved ? (
                          <form action={rejectAction}>
                            <input type="hidden" name="id" value={review.id} />
                            <button type="submit" className="font-semibold text-[var(--muted)]">
                              Unapprove
                            </button>
                          </form>
                        ) : (
                          <form action={approveAction}>
                            <input type="hidden" name="id" value={review.id} />
                            <button type="submit" className="font-semibold text-[var(--brand)]">
                              Approve
                            </button>
                          </form>
                        )}
                      </RoleGate>
                      <RoleGate permission="reviews.delete">
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={review.id} />
                          <button type="submit" className="font-semibold text-[var(--danger)]">
                            Delete
                          </button>
                        </form>
                      </RoleGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
