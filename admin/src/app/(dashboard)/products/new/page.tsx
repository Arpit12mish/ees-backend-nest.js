import Link from 'next/link';
import { getCategories } from '@/lib/api/categories.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductForm } from '@/components/products/ProductForm';

export default async function NewProductPage() {
  const token = await getServerToken();
  const categories = await getCategories(token);

  return (
    <div>
      <SectionHeading
        title="New product"
        action={
          <Link href="/products" className="text-sm font-semibold text-[var(--brand)]">
            ← Back to products
          </Link>
        }
      />
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
