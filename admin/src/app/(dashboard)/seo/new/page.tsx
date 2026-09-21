import { SectionHeading } from '@/components/common/SectionHeading';
import { NewSeoForm } from '@/components/seo/NewSeoForm';

export default function NewSeoPage() {
  return (
    <div>
      <SectionHeading title="New SEO record" />
      <NewSeoForm />
    </div>
  );
}
