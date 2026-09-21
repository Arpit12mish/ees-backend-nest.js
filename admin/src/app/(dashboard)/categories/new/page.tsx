import { SectionHeading } from '@/components/common/SectionHeading';
import { CategoryForm } from '@/components/categories/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div>
      <SectionHeading title="New category" />
      <CategoryForm mode="create" />
    </div>
  );
}
