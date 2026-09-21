# Database Schema

The schema is defined in `prisma/schema.prisma`. The datasource is PostgreSQL and Prisma Client uses the Prisma 7 PostgreSQL adapter.

## Enums

| Enum | Values | Purpose |
| --- | --- | --- |
| `ProductStatus` | `DRAFT`, `PUBLISHED`, `INACTIVE` | Controls product visibility. Public APIs expose only `PUBLISHED`. |
| `StockStatus` | `IN_STOCK`, `OUT_OF_STOCK`, `LOW_STOCK` | Tracks stock display and purchase eligibility. |
| `OrderStatus` | `PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `FAILED` | Order lifecycle state. |
| `PaymentStatus` | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` | Payment state. |
| `SeoEntityType` | `PRODUCT`, `CATEGORY`, `COLLECTION`, `HOME` | Entity type for SEO metadata. `HOME` exists in the enum but no home model is present. |
| `AdminRole` | `SUPER_ADMIN`, `ADMIN`, `EDITOR` | Admin authorization roles. |
| `CouponType` | `PERCENTAGE`, `FIXED_AMOUNT`, `FREE_SHIPPING` | Discount calculation mode. |

## AdminUser

Purpose: stores backend admin users.

Important fields:

- `email` is unique.
- `passwordHash` stores bcrypt hash.
- `role` defaults to `ADMIN`.
- `isActive` gates login.
- `lastLoginAt` updates on successful login.

Relationships:

- `statusHistories` to `OrderStatusHistory`.

Constraints:

- Primary key: `id`
- Unique: `email`

## Category

Purpose: product category used by public catalog and admin catalog.

Important fields:

- `name`
- `slug` unique public identifier
- `description`
- `imageUrl`
- `priority`
- `isActive`

Relationships:

- One category has many `Product`.

Constraints:

- Primary key: `id`
- Unique: `slug`

## Product

Purpose: sellable catalog item.

Important fields:

- `name`, `slug`, `sku`
- `shortDescription`, `longDescription`
- `storySummary`, `spiritualBenefitSummary`, `usageGuide`, `careInstructions`
- `price`, `mrp`, `discountPercent`, `currency`
- `stockStatus`, `inventoryQuantity`, `lowStockThreshold`
- `categoryId`
- `status`
- `priority`
- `attributes` JSON for flexible stone/product metadata
- `publishedAt`

Relationships:

- Belongs to `Category`.
- Has many `ProductImage`.
- Has many `CollectionProduct`.
- Referenced by `CartItem` and `OrderItem`.

Constraints and indexes:

- Unique: `slug`
- Unique: `sku`
- Indexes: `status`, `categoryId`, `priority`

## ProductImage

Purpose: images attached to products for public cards, product detail pages, SEO, and admin management.

Important fields:

- `productId`
- `imageUrl` legacy/default image URL
- `thumbnailUrl`, `cardUrl`, `detailUrl`
- `storageKey`, `storageProvider`
- `mimeType`, `sizeBytes`
- `altText`, `title`
- `width`, `height`
- `sortOrder`, `isPrimary`

Relationships:

- Belongs to `Product`.
- Deleted when product is deleted by database cascade. Current product delete API soft-deactivates instead of deleting.

Constraints and indexes:

- Index: `productId`

## Collection

Purpose: curated groups such as best sellers, money attraction picks, and protection essentials.

Important fields:

- `name`
- `slug` unique public identifier
- `description`
- `imageUrl`
- `priority`
- `isActive`

Relationships:

- Has many `CollectionProduct`.

Constraints:

- Unique: `slug`

## CollectionProduct

Purpose: join table between collections and products.

Important fields:

- `collectionId`
- `productId`
- `sortOrder`

Relationships:

- Belongs to `Collection`.
- Belongs to `Product`.
- Cascades on collection or product deletion.

Constraints:

- Unique: `[collectionId, productId]`

## SeoMetadata

Purpose: editable SEO metadata for product, category, collection, and home entities.

Important fields:

- `entityType`
- `entityId`
- `seoTitle`, `seoDescription`, `seoKeywords`
- `canonicalUrl`
- `ogTitle`, `ogDescription`, `ogImageUrl`
- `twitterTitle`, `twitterDescription`, `twitterImageUrl`
- `schemaType`

Constraints and indexes:

- Unique: `[entityType, entityId]`
- Index: `[entityType, entityId]`

Note: `entityId` is used for all entity types. For `HOME`, the current admin service uses `"HOME"` as the entity id when none is supplied.

## Coupon

Purpose: discount and free-shipping rules.

Important fields:

- `code` unique, normalized to uppercase by services
- `type`
- `value`
- `minOrderAmount`
- `maxDiscountAmount`
- `startDate`, `endDate`
- `usageLimit`, `usedCount`
- `isActive`

Constraints and indexes:

- Unique: `code`
- Index: `code`

## Cart

Purpose: session-based cart.

Important fields:

- `sessionId` unique
- `userEmail`, `userPhone`
- `couponCode`

Relationships:

- Has many `CartItem`.

Constraints and indexes:

- Unique: `sessionId`
- Index: `sessionId`

## CartItem

Purpose: product quantity in a cart.

Important fields:

- `cartId`
- `productId`
- `quantity`
- `priceAtAdd`

Relationships:

- Belongs to `Cart`, cascade delete.
- Belongs to `Product`.

## Order

Purpose: customer order created from a cart.

Important fields:

- `orderNumber` unique
- `customerName`, `customerEmail`, `customerPhone`
- `shippingAddress` JSON
- `subtotal`, `discountAmount`, `shippingAmount`, `grandTotal`
- `couponCode`
- `paymentStatus`
- `orderStatus`

Relationships:

- Has many `OrderItem`.
- Has many `Payment`.
- Has many `OrderStatusHistory`.

Constraints and indexes:

- Unique: `orderNumber`
- Indexes: `orderNumber`, `paymentStatus`, `orderStatus`, `customerEmail`

## OrderItem

Purpose: immutable-ish order product snapshot.

Important fields:

- `orderId`
- `productId`
- `productName`
- `sku`
- `imageUrl`
- `priceAtPurchase`
- `quantity`
- `subtotal`

Relationships:

- Belongs to `Order`, cascade delete.
- Belongs to `Product`.

## OrderStatusHistory

Purpose: readable admin/order timeline.

Important fields:

- `orderId`
- `oldStatus`
- `newStatus`
- `note`
- `changedByAdminId`
- `createdAt`

Relationships:

- Belongs to `Order`, cascade delete.
- Optionally belongs to `AdminUser`.

## Payment

Purpose: payment records created by the payment module.

Important fields:

- `orderId`
- `provider`
- `providerPaymentId`
- `providerOrderId`
- `amount`
- `currency`
- `status`
- `rawResponse`

Relationships:

- Belongs to `Order`.

## Models Not Present

The current schema does not implement homepage, CMS pages, FAQs, reviews, leads, shipping zones, or shipping configuration models.
