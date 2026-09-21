import { notFound } from 'next/navigation';
import { getCategory } from '@/lib/api/categories.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CategoryForm } from '@/components/categories/CategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const category = await getCategory(id, token).catch(() => null);
  if (!category) notFound();

  return (
    <div>
      <SectionHeading title={category.name} eyebrow="Category" />
      <CategoryForm mode="edit" initial={category} />
    </div>
  );
}
