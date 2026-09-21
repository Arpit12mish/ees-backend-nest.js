import Link from 'next/link';
import { getGuides } from '@/lib/api/guides.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { GuidesTable } from '@/components/guides/GuidesTable';
import { deleteGuideAction } from './actions';

export default async function GuidesPage() {
  const token = await getServerToken();
  const guides = await getGuides(token);

  return (
    <div>
      <SectionHeading
        title="Guides"
        description={`${guides.length} guides`}
        action={
          <RoleGate permission="guides.write">
            <Link
              href="/guides/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New guide
            </Link>
          </RoleGate>
        }
      />
      <GuidesTable guides={guides} deleteAction={deleteGuideAction} />
    </div>
  );
}
