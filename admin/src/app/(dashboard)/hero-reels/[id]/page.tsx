import { notFound } from 'next/navigation';
import { getHeroReel } from '@/lib/api/hero-reels.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { HeroReelForm } from '@/components/hero-reels/HeroReelForm';

export default async function EditHeroReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const reel = await getHeroReel(id, token).catch(() => null);
  if (!reel) notFound();

  return (
    <div>
      <SectionHeading title={reel.product?.name ?? 'Hero reel'} eyebrow="Hero reel" />
      <HeroReelForm mode="edit" initial={reel} />
    </div>
  );
}
