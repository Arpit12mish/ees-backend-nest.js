import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api/products.api';
import { getCategories } from '@/lib/api/categories.api';
import { getSeoByEntity } from '@/lib/api/seo.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductStatusControl } from '@/components/products/ProductStatusControl';
import { ProductImageManager } from '@/components/products/ProductImageManager';
import { SeoEditor } from '@/components/seo/SeoEditor';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const [product, categories] = await Promise.all([
    getProduct(id, token).catch(() => null),
    getCategories(token),
  ]);
  if (!product) notFound();

  const seo = await getSeoByEntity('PRODUCT', product.id, token);

  return (
    <div className="space-y-6">
      <SectionHeading title={product.name} eyebrow="Product" />
      <ProductForm mode="edit" initial={product} categories={categories} />
      <ProductStatusControl productId={product.id} currentStatus={product.status} />
      <ProductImageManager productId={product.id} initialImages={product.images} />
      <SeoEditor entityType="PRODUCT" entityId={product.id} initialData={seo} />
    </div>
  );
}
