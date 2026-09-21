import { notFound } from 'next/navigation';
import { getGuide } from '@/lib/api/guides.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { GuideForm } from '@/components/guides/GuideForm';

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const guide = await getGuide(id, token).catch(() => null);
  if (!guide) notFound();

  return (
    <div>
      <SectionHeading title={guide.title} eyebrow="Guide" />
      <GuideForm mode="edit" initial={guide} />
    </div>
  );
}
