import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Category,
  Collection,
  Guide,
  Product,
  ProductImage,
  Service,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SeoService {
  private readonly frontendBaseUrl: string;
  private readonly brandName = 'Enchanted Energy Store';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.frontendBaseUrl = this.config.get<string>(
      'frontendBaseUrl',
      'http://localhost:3000',
    );
  }

  async getProductSeo(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'PUBLISHED', category: { isActive: true } },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });
    if (!product)
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });

    const seo = await this.prisma.seoMetadata.findFirst({
      where: { entityType: 'PRODUCT', entityId: product.id },
    });

    const defaults = this.generateDefaultProductSeo(product);
    const title = seo?.seoTitle ?? defaults.title;
    const description = seo?.seoDescription ?? defaults.description;
    const image = seo?.ogImageUrl ?? defaults.image;
    const canonicalUrl = seo?.canonicalUrl ?? defaults.canonicalUrl;

    return {
      title,
      description,
      keywords: seo?.seoKeywords ?? '',
      canonicalUrl,
      robots: this.getRobots(seo?.noindex),
      openGraph: {
        title: seo?.ogTitle ?? title,
        description: seo?.ogDescription ?? description,
        image,
      },
      twitter: {
        title: seo?.twitterTitle ?? title,
        description: seo?.twitterDescription ?? description,
        image: seo?.twitterImageUrl ?? seo?.ogImageUrl ?? image,
      },
    };
  }

  async getCategorySeo(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
    });
    if (!category)
      throw new NotFoundException({
        message: 'Category not found',
        errorCode: 'CATEGORY_NOT_FOUND',
      });

    const seo = await this.prisma.seoMetadata.findFirst({
      where: { entityType: 'CATEGORY', entityId: category.id },
    });

    const defaults = this.generateDefaultCategorySeo(category);
    const title = seo?.seoTitle ?? defaults.title;
    const description = seo?.seoDescription ?? defaults.description;
    const canonicalUrl = seo?.canonicalUrl ?? defaults.canonicalUrl;
    const image = seo?.ogImageUrl ?? defaults.image;

    return {
      title,
      description,
      keywords: seo?.seoKeywords ?? '',
      canonicalUrl,
      robots: this.getRobots(seo?.noindex),
      openGraph: {
        title: seo?.ogTitle ?? title,
        description: seo?.ogDescription ?? description,
        image,
      },
      twitter: {
        title: seo?.twitterTitle ?? seo?.ogTitle ?? title,
        description:
          seo?.twitterDescription ?? seo?.ogDescription ?? description,
        image: seo?.twitterImageUrl ?? image,
      },
    };
  }

  async getCollectionSeo(slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { slug, isActive: true },
    });
    if (!collection)
      throw new NotFoundException({
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });

    const seo = await this.prisma.seoMetadata.findFirst({
      where: { entityType: 'COLLECTION', entityId: collection.id },
    });

    const defaults = this.generateDefaultCollectionSeo(collection);
    const title = seo?.seoTitle ?? defaults.title;
    const description = seo?.seoDescription ?? defaults.description;
    const canonicalUrl = seo?.canonicalUrl ?? defaults.canonicalUrl;
    const image = seo?.ogImageUrl ?? defaults.image;

    return {
      title,
      description,
      keywords: seo?.seoKeywords ?? '',
      canonicalUrl,
      robots: this.getRobots(seo?.noindex),
      openGraph: {
        title: seo?.ogTitle ?? title,
        description: seo?.ogDescription ?? description,
        image,
      },
      twitter: {
        title: seo?.twitterTitle ?? seo?.ogTitle ?? title,
        description:
          seo?.twitterDescription ?? seo?.ogDescription ?? description,
        image: seo?.twitterImageUrl ?? image,
      },
    };
  }

  async getServiceSeo(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, isActive: true },
    });
    if (!service)
      throw new NotFoundException({
        message: 'Service not found',
        errorCode: 'SERVICE_NOT_FOUND',
      });

    const seo = await this.prisma.seoMetadata.findFirst({
      where: { entityType: 'SERVICE', entityId: service.id },
    });

    const defaults = this.generateDefaultServiceSeo(service);
    const title = seo?.seoTitle ?? defaults.title;
    const description = seo?.seoDescription ?? defaults.description;
    const canonicalUrl = seo?.canonicalUrl ?? defaults.canonicalUrl;
    const image = seo?.ogImageUrl ?? defaults.image;

    return {
      title,
      description,
      keywords: seo?.seoKeywords ?? '',
      canonicalUrl,
      robots: this.getRobots(seo?.noindex),
      openGraph: {
        title: seo?.ogTitle ?? title,
        description: seo?.ogDescription ?? description,
        image,
      },
      twitter: {
        title: seo?.twitterTitle ?? seo?.ogTitle ?? title,
        description:
          seo?.twitterDescription ?? seo?.ogDescription ?? description,
        image: seo?.twitterImageUrl ?? image,
      },
    };
  }

  async getGuideSeo(slug: string) {
    const guide = await this.prisma.guide.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!guide)
      throw new NotFoundException({
        message: 'Guide not found',
        errorCode: 'GUIDE_NOT_FOUND',
      });

    const seo = await this.prisma.seoMetadata.findFirst({
      where: { entityType: 'GUIDE', entityId: guide.id },
    });

    const defaults = this.generateDefaultGuideSeo(guide);
    const title = seo?.seoTitle ?? defaults.title;
    const description = seo?.seoDescription ?? defaults.description;
    const canonicalUrl = seo?.canonicalUrl ?? defaults.canonicalUrl;
    const image = seo?.ogImageUrl ?? defaults.image;

    return {
      title,
      description,
      keywords: seo?.seoKeywords ?? '',
      canonicalUrl,
      robots: this.getRobots(seo?.noindex),
      openGraph: {
        title: seo?.ogTitle ?? title,
        description: seo?.ogDescription ?? description,
        image,
      },
      twitter: {
        title: seo?.twitterTitle ?? seo?.ogTitle ?? title,
        description:
          seo?.twitterDescription ?? seo?.ogDescription ?? description,
        image: seo?.twitterImageUrl ?? image,
      },
    };
  }

  generateDefaultGuideSeo(guide: Guide) {
    return {
      title: `${guide.title} | ${this.brandName}`,
      description:
        guide.excerpt ?? `${guide.title} — a guide from ${this.brandName}.`,
      image: guide.coverImageUrl ?? '',
      canonicalUrl: `${this.frontendBaseUrl}/guides/${guide.slug}`,
    };
  }

  private getRobots(noindex?: boolean) {
    return noindex ? 'noindex,nofollow' : 'index,follow';
  }

  async getMerchantFeedXml() {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        category: { isActive: true },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { priority: 'desc' },
    });

    const items = products
      .map((product) => {
        const image = this.getSeoImageUrl(product.images[0]);
        if (!image) return '';
        // Google's `availability` enum is only: in stock / out of stock /
        // preorder / backorder — "limited availability" is not a valid
        // value and would get the item disapproved. LOW_STOCK items are
        // still purchasable, so they count as in stock.
        const availability =
          product.stockStatus === 'OUT_OF_STOCK' ? 'out of stock' : 'in stock';

        const price = Number(product.price);
        const mrp = Number(product.mrp);
        // When the item is actually discounted, Google expects the
        // original price in <g:price> and the discounted price in
        // <g:sale_price> so Shopping ads can render the strikethrough —
        // sending sale_price when there's no real discount is discouraged.
        const priceTags =
          mrp > price
            ? `<g:price>${mrp.toFixed(2)} ${product.currency}</g:price>
    <g:sale_price>${price.toFixed(2)} ${product.currency}</g:sale_price>`
            : `<g:price>${price.toFixed(2)} ${product.currency}</g:price>`;

        return `  <item>
    <g:id>${this.escapeXml(product.sku)}</g:id>
    <title>${this.escapeXml(product.name)}</title>
    <description>${this.escapeXml(product.shortDescription ?? product.name)}</description>
    <link>${this.escapeXml(`${this.frontendBaseUrl}/products/${product.slug}`)}</link>
    <g:image_link>${this.escapeXml(image)}</g:image_link>
    <g:availability>${availability}</g:availability>
    ${priceTags}
    <g:brand>${this.escapeXml(this.brandName)}</g:brand>
    <g:mpn>${this.escapeXml(product.sku)}</g:mpn>
    <g:condition>new</g:condition>
  </item>`;
      })
      .filter(Boolean)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${this.escapeXml(this.brandName)} Product Feed</title>
  <link>${this.escapeXml(this.frontendBaseUrl)}</link>
  <description>Product feed for Google Merchant Center</description>
${items}
</channel>
</rss>`;
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  generateDefaultProductSeo(product: Product & { images?: ProductImage[] }) {
    return {
      title: `${product.name} | ${this.brandName}`,
      description:
        product.shortDescription ??
        `${product.name} is traditionally associated with mindful energy practices.`,
      image: this.getSeoImageUrl(product.images?.[0]),
      canonicalUrl: `${this.frontendBaseUrl}/products/${product.slug}`,
    };
  }

  generateDefaultCategorySeo(category: Category) {
    return {
      title: `${category.name} | ${this.brandName}`,
      description:
        category.description ??
        `${category.name} products are often chosen for mindful energy practices.`,
      image: category.imageUrl ?? '',
      canonicalUrl: `${this.frontendBaseUrl}/categories/${category.slug}`,
    };
  }

  generateDefaultCollectionSeo(collection: Collection) {
    return {
      title: `${collection.name} | ${this.brandName}`,
      description:
        collection.description ??
        `${collection.name} products are commonly used for intention-led routines.`,
      image: collection.imageUrl ?? '',
      canonicalUrl: `${this.frontendBaseUrl}/collections/${collection.slug}`,
    };
  }

  generateDefaultServiceSeo(service: Service) {
    return {
      title: `${service.name} | ${this.brandName}`,
      description:
        service.description ??
        `${service.name} is offered by ${this.brandName} as a mindful energy service.`,
      image: service.imageUrl ?? '',
      canonicalUrl: `${this.frontendBaseUrl}/services/${service.slug}`,
    };
  }

  async getProductSchema(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'PUBLISHED', category: { isActive: true } },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
    if (!product)
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });

    const availability =
      product.stockStatus === 'IN_STOCK'
        ? 'https://schema.org/InStock'
        : product.stockStatus === 'LOW_STOCK'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/OutOfStock';

    const [ratingSummary, topReviews] = await Promise.all([
      this.prisma.review.aggregate({
        where: { productId: product.id, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.prisma.review.findMany({
        where: { productId: product.id, isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          customerName: true,
          rating: true,
          title: true,
          comment: true,
        },
      }),
    ]);

    const reviewCount = ratingSummary._count.rating;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.shortDescription ?? '',
      image: product.images
        .map((img) => this.getSeoImageUrl(img))
        .filter(Boolean),
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: this.brandName,
      },
      offers: {
        '@type': 'Offer',
        price: Number(product.price).toFixed(2),
        priceCurrency: product.currency,
        availability,
        itemCondition: 'https://schema.org/NewCondition',
        url: `${this.frontendBaseUrl}/products/${slug}`,
      },
      ...(reviewCount > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: Number(ratingSummary._avg.rating).toFixed(1),
              reviewCount,
            },
            review: topReviews.map((r) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: r.customerName },
              name: r.title ?? undefined,
              reviewBody: r.comment,
              reviewRating: {
                '@type': 'Rating',
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
              },
            })),
          }
        : {}),
    };
  }

  private getSeoImageUrl(
    image?: Pick<ProductImage, 'detailUrl' | 'cardUrl' | 'imageUrl'> | null,
  ) {
    return image?.detailUrl ?? image?.cardUrl ?? image?.imageUrl ?? '';
  }

  async getSitemapData() {
    const [products, categories, collections, services, guides] =
      await Promise.all([
        this.prisma.product.findMany({
          where: { status: 'PUBLISHED', category: { isActive: true } },
          select: {
            slug: true,
            updatedAt: true,
            priority: true,
            images: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              take: 5,
              select: { detailUrl: true, cardUrl: true, imageUrl: true },
            },
          },
          orderBy: { priority: 'desc' },
        }),
        this.prisma.category.findMany({
          where: { isActive: true },
          select: {
            slug: true,
            updatedAt: true,
            priority: true,
            imageUrl: true,
          },
        }),
        this.prisma.collection.findMany({
          where: { isActive: true },
          select: {
            slug: true,
            updatedAt: true,
            priority: true,
            imageUrl: true,
          },
        }),
        this.prisma.service.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, priority: true },
        }),
        this.prisma.guide.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
        }),
      ]);

    const urls: Array<{
      url: string;
      lastModified: string;
      changeFrequency: string;
      priority: number;
      type: string;
      images?: string[];
    }> = [];

    for (const p of products) {
      const images = p.images
        .map((img) => this.getSeoImageUrl(img))
        .filter(Boolean);
      urls.push({
        url: `${this.frontendBaseUrl}/products/${p.slug}`,
        lastModified: p.updatedAt.toISOString(),
        changeFrequency: 'weekly',
        priority: p.priority >= 10 ? 0.9 : 0.7,
        type: 'product',
        images: images.length ? images : undefined,
      });
    }

    for (const c of categories) {
      urls.push({
        url: `${this.frontendBaseUrl}/categories/${c.slug}`,
        lastModified: c.updatedAt.toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
        type: 'category',
        images: c.imageUrl ? [c.imageUrl] : undefined,
      });
    }

    for (const col of collections) {
      urls.push({
        url: `${this.frontendBaseUrl}/collections/${col.slug}`,
        lastModified: col.updatedAt.toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
        type: 'collection',
        images: col.imageUrl ? [col.imageUrl] : undefined,
      });
    }

    for (const s of services) {
      urls.push({
        url: `${this.frontendBaseUrl}/services/${s.slug}`,
        lastModified: s.updatedAt.toISOString(),
        changeFrequency: 'monthly',
        priority: 0.6,
        type: 'service',
      });
    }

    for (const g of guides) {
      urls.push({
        url: `${this.frontendBaseUrl}/guides/${g.slug}`,
        lastModified: g.updatedAt.toISOString(),
        changeFrequency: 'monthly',
        priority: 0.6,
        type: 'guide',
      });
    }

    return urls;
  }
}
