import Link from 'next/link';
import { getCategories } from '@/lib/api/categories.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { CategoriesTable } from '@/components/categories/CategoriesTable';
import { deleteCategoryAction } from './actions';

export default async function CategoriesPage() {
  const token = await getServerToken();
  const categories = await getCategories(token);

  return (
    <div>
      <SectionHeading
        title="Categories"
        description={`${categories.length} categories`}
        action={
          <RoleGate permission="categories.write">
            <Link
              href="/categories/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New category
            </Link>
          </RoleGate>
        }
      />

      <CategoriesTable categories={categories} deleteAction={deleteCategoryAction} />
    </div>
  );
}
