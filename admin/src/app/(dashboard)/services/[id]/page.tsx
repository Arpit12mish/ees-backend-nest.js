import { notFound } from 'next/navigation';
import { getService } from '@/lib/api/services.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceForm } from '@/components/services/ServiceForm';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const service = await getService(id, token).catch(() => null);
  if (!service) notFound();

  return (
    <div>
      <SectionHeading title={service.name} eyebrow="Service" />
      <ServiceForm mode="edit" initial={service} />
    </div>
  );
}
