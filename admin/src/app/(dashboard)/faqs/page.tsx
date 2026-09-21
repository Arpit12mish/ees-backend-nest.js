import Link from 'next/link';
import { getFaqs } from '@/lib/api/faqs.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { FaqsTable } from '@/components/faqs/FaqsTable';
import { deleteFaqAction } from './actions';

export default async function FaqsPage() {
  const token = await getServerToken();
  const faqs = await getFaqs(token);

  return (
    <div>
      <SectionHeading
        title="FAQs"
        description={`${faqs.length} FAQs`}
        action={
          <RoleGate permission="faqs.write">
            <Link
              href="/faqs/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New FAQ
            </Link>
          </RoleGate>
        }
      />
      <FaqsTable faqs={faqs} deleteAction={deleteFaqAction} />
    </div>
  );
}
