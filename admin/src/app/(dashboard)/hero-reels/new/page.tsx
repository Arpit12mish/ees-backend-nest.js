import { SectionHeading } from '@/components/common/SectionHeading';
import { HeroReelForm } from '@/components/hero-reels/HeroReelForm';

export default function NewHeroReelPage() {
  return (
    <div>
      <SectionHeading title="New hero reel" />
      <HeroReelForm mode="create" />
    </div>
  );
}
