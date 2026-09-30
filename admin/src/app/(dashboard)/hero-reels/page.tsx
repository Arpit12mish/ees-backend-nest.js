import Link from 'next/link';
import { getHeroReels } from '@/lib/api/hero-reels.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { HeroReelsTable } from '@/components/hero-reels/HeroReelsTable';
import { deleteHeroReelAction } from './actions';

export default async function HeroReelsPage() {
  const token = await getServerToken();
  const reels = await getHeroReels(token);

  return (
    <div>
      <SectionHeading
        title="Hero reels"
        description={`${reels.length} reels shown on the home page hero`}
        action={
          <RoleGate permission="heroReels.write">
            <Link
              href="/hero-reels/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New reel
            </Link>
          </RoleGate>
        }
      />

      <HeroReelsTable reels={reels} deleteAction={deleteHeroReelAction} />
    </div>
  );
}
