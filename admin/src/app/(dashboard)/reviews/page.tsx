import { getReviews } from '@/lib/api/reviews.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ReviewsTable } from '@/components/reviews/ReviewsTable';
import { approveReviewAction, deleteReviewAction, rejectReviewAction } from './actions';

export default async function ReviewsPage() {
  const token = await getServerToken();
  const reviews = await getReviews(token);
  const pending = reviews.filter((r) => !r.isApproved).length;

  return (
    <div>
      <SectionHeading
        title="Reviews"
        description={`${reviews.length} reviews · ${pending} pending approval`}
      />
      <ReviewsTable
        reviews={reviews}
        approveAction={approveReviewAction}
        rejectAction={rejectReviewAction}
        deleteAction={deleteReviewAction}
      />
    </div>
  );
}
