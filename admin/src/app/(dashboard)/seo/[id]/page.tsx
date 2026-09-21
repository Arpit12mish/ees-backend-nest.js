import { notFound } from 'next/navigation';
import { getSeoById } from '@/lib/api/seo.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SeoEditor } from '@/components/seo/SeoEditor';

export default async function EditSeoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const record = await getSeoById(id, token).catch(() => null);
  if (!record) notFound();

  return (
    <div>
      <SectionHeading title={record.seoTitle || record.entityId} eyebrow={record.entityType} />
      <SeoEditor entityType={record.entityType} entityId={record.entityId} initialData={record} />
    </div>
  );
}
