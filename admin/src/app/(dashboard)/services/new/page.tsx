import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceForm } from '@/components/services/ServiceForm';

export default function NewServicePage() {
  return (
    <div>
      <SectionHeading title="New service" />
      <ServiceForm mode="create" />
    </div>
  );
}
