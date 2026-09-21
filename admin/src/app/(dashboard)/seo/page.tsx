import Link from 'next/link';
import { getSeoRecords } from '@/lib/api/seo.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SeoRecordsTable } from '@/components/seo/SeoRecordsTable';
import { deleteSeoAction } from './actions';

export default async function SeoPage() {
  const token = await getServerToken();
  const records = await getSeoRecords(token);

  return (
    <div>
      <SectionHeading
        title="SEO metadata"
        description={`${records.length} records — most SEO editing happens inline on each product, category, or collection's edit page.`}
        action={
          <Link
            href="/seo/new"
            className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
          >
            New / Home SEO
          </Link>
        }
      />
      <SeoRecordsTable records={records} deleteAction={deleteSeoAction} />
    </div>
  );
}
