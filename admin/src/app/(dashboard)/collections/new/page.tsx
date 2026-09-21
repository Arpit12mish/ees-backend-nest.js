import { SectionHeading } from '@/components/common/SectionHeading';
import { CollectionForm } from '@/components/collections/CollectionForm';

export default function NewCollectionPage() {
  return (
    <div>
      <SectionHeading title="New collection" />
      <CollectionForm mode="create" />
    </div>
  );
}
