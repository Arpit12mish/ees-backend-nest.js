import { notFound } from 'next/navigation';
import { getFaq } from '@/lib/api/faqs.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FaqForm } from '@/components/faqs/FaqForm';

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const faq = await getFaq(id, token).catch(() => null);
  if (!faq) notFound();

  return (
    <div>
      <SectionHeading title={faq.question} eyebrow="FAQ" />
      <FaqForm mode="edit" initial={faq} />
    </div>
  );
}
