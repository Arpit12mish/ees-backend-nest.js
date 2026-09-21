import { getCategories } from '@/lib/api/categories.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductForm } from '@/components/products/ProductForm';

export default async function NewProductPage() {
  const token = await getServerToken();
  const categories = await getCategories(token);

  return (
    <div>
      <SectionHeading title="New product" />
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
