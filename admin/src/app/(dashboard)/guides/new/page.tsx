import { SectionHeading } from '@/components/common/SectionHeading';
import { GuideForm } from '@/components/guides/GuideForm';

export default function NewGuidePage() {
  return (
    <div>
      <SectionHeading title="New guide" />
      <GuideForm mode="create" />
    </div>
  );
}
