import { SectionHeading } from '@/components/common/SectionHeading';
import { FaqForm } from '@/components/faqs/FaqForm';

export default function NewFaqPage() {
  return (
    <div>
      <SectionHeading title="New FAQ" />
      <FaqForm mode="create" />
    </div>
  );
}
