import Link from 'next/link';
import { getCollections } from '@/lib/api/collections.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { CollectionsTable } from '@/components/collections/CollectionsTable';
import { deleteCollectionAction } from './actions';

export default async function CollectionsPage() {
  const token = await getServerToken();
  const collections = await getCollections(token);

  return (
    <div>
      <SectionHeading
        title="Collections"
        description={`${collections.length} collections`}
        action={
          <RoleGate permission="collections.write">
            <Link
              href="/collections/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New collection
            </Link>
          </RoleGate>
        }
      />
      <CollectionsTable collections={collections} deleteAction={deleteCollectionAction} />
    </div>
  );
}
