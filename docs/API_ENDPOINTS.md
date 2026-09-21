# API Endpoints

Base URL:

```text
http://localhost:8080/api
```

Success envelope:

```json
{ "success": true, "message": "Message", "data": {} }
```

Error envelope:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "path": "/api/path"
}
```

Admin routes require:

```http
Authorization: Bearer <accessToken>
```

## Health

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | App and database health check. |

Example:

```bash
curl http://localhost:8080/api/health
```

Response:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": { "status": "ok", "database": "connected" }
}
```

## Public Categories

| Method | Path | Auth | Query | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/public/categories` | Public | `page`, `limit` | List active categories. |
| GET | `/api/public/categories/:slug` | Public | none | Get one active category by slug. |

Common errors:

- `CATEGORY_NOT_FOUND`
- validation errors for invalid pagination query values

## Public Products

| Method | Path | Auth | Query | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/public/products` | Public | `page`, `limit`, `category`, `collection`, `minPrice`, `maxPrice`, `search`, `sort` | List published products in active categories. |
| GET | `/api/public/products/featured` | Public | none | Return up to 12 published products in active `best-sellers` collection. |
| GET | `/api/public/products/search` | Public | `q`, `page`, `limit` | Search published products by name, description, or SKU. |
| GET | `/api/public/products/category/:categorySlug` | Public | product list query | List published products for an active category slug. |
| GET | `/api/public/products/:slug` | Public | none | Product detail with category, images, primary image, attributes, and SEO metadata. |

Sort values:

- `newest`
- `price_low_to_high`
- `price_high_to_low`
- `priority`

Product image fields include `imageUrl`, `thumbnailUrl`, `cardUrl`, `detailUrl`, `altText`, `title`, `width`, `height`, `sortOrder`, and `isPrimary`.

Common errors:

- `PRODUCT_NOT_FOUND`
- validation errors for query params

## Public Collections

| Method | Path | Auth | Query | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/public/collections` | Public | none | List active collections. |
| GET | `/api/public/collections/:slug` | Public | none | Get one active collection by slug. |
| GET | `/api/public/collections/:slug/products` | Public | `page`, `limit` | List published products in an active collection. |

Common errors:

- `COLLECTION_NOT_FOUND`

## SEO

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/public/seo/product/:slug` | Public | Product metadata for frontend SEO. |
| GET | `/api/public/seo/category/:slug` | Public | Category metadata. |
| GET | `/api/public/seo/collection/:slug` | Public | Collection metadata. |
| GET | `/api/public/seo/product-schema/:slug` | Public | Product JSON-LD data. |
| GET | `/api/public/sitemap-data` | Public | Public product, category, and collection URLs. |

Product SEO response data:

```json
{
  "title": "Rose Quartz Bracelet | Energy Essentials Store",
  "description": "Safe SEO description",
  "keywords": "rose quartz,bracelet",
  "canonicalUrl": "http://localhost:3000/products/rose-quartz-bracelet",
  "openGraph": {
    "title": "Rose Quartz Bracelet",
    "description": "Safe OG description",
    "image": "https://example.com/image.webp"
  },
  "twitter": {
    "title": "Rose Quartz Bracelet",
    "description": "Safe Twitter description",
    "image": "https://example.com/image.webp"
  }
}
```

Common errors:

- `PRODUCT_NOT_FOUND`
- `CATEGORY_NOT_FOUND`
- `COLLECTION_NOT_FOUND`

## Cart

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/cart/items` | Public | Add product to cart. |
| GET | `/api/cart/:sessionId` | Public | Get cart totals and items. |
| PATCH | `/api/cart/items/:itemId` | Public | Update cart item quantity. |
| DELETE | `/api/cart/items/:itemId` | Public | Remove one cart item. |
| DELETE | `/api/cart/:sessionId/clear` | Public | Clear cart items. |

Add item request:

```json
{
  "sessionId": "guest-session-id",
  "productId": "product_cuid",
  "quantity": 2,
  "userEmail": "buyer@example.com",
  "userPhone": "+911234567890"
}
```

Update item request:

```json
{ "quantity": 3 }
```

Common errors:

- `PRODUCT_NOT_FOUND`
- `PRODUCT_OUT_OF_STOCK`
- `INSUFFICIENT_STOCK`
- `CART_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`

## Orders

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/orders` | Public | Create order from a cart. |
| GET | `/api/orders/:orderNumber` | Public | Get order by order number. |

Create order request:

```json
{
  "sessionId": "guest-session-id",
  "customerName": "Test Buyer",
  "customerEmail": "buyer@example.com",
  "customerPhone": "+911234567890",
  "shippingAddress": {
    "line1": "123 Test Street",
    "line2": "Apartment 1",
    "city": "Mumbai",
    "state": "MH",
    "pincode": "400001",
    "country": "India"
  }
}
```

Common errors:

- `CART_EMPTY`
- `PRODUCT_UNAVAILABLE`
- `PRODUCT_OUT_OF_STOCK`
- `INSUFFICIENT_STOCK`
- `ORDER_NOT_FOUND`

## Payments

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/payments/create` | Public | Create a mock payment row for an order. |
| POST | `/api/payments/verify` | Public | Verify mock payment and confirm order. |
| GET | `/api/payments/status/:orderNumber` | Public | Get latest payment status for an order. |

Create payment request:

```json
{ "orderNumber": "ORD-20260516-000001" }
```

Verify payment request:

```json
{
  "orderNumber": "ORD-20260516-000001",
  "mockPaymentId": "mock_pay_xxx"
}
```

Common errors:

- `ORDER_NOT_FOUND`
- `PAYMENT_NOT_FOUND`
- `PAYMENT_VERIFICATION_FAILED`
- `INSUFFICIENT_STOCK`

## Coupons

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/coupons/validate` | Public | Validate and apply coupon to a cart. |
| DELETE | `/api/coupons/:sessionId` | Public | Remove coupon from cart. |

Validate request:

```json
{
  "code": "WELCOME10",
  "sessionId": "guest-session-id"
}
```

Optional request field:

```json
{ "orderAmount": 1000 }
```

Success data:

```json
{
  "code": "WELCOME10",
  "type": "PERCENTAGE",
  "value": 10,
  "discountAmount": 100,
  "isFreeShipping": false
}
```

Common errors:

- `COUPON_NOT_FOUND`
- `COUPON_NOT_ACTIVE`
- `COUPON_EXPIRED`
- `COUPON_LIMIT_REACHED`
- `COUPON_MIN_AMOUNT`
- `CART_NOT_FOUND`

## Admin Auth

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/admin/auth/login` | Public, throttled | Admin login. |
| GET | `/api/admin/auth/me` | JWT | Current admin profile. |

Login request:

```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

Login success:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt",
    "admin": {
      "id": "admin_cuid",
      "name": "Default Admin",
      "email": "admin@example.com",
      "role": "SUPER_ADMIN"
    }
  }
}
```

Common errors:

- `INVALID_CREDENTIALS`
- `ACCOUNT_INACTIVE`
- `UNAUTHORIZED`

## Admin Categories

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/categories` | JWT | Any admin | List all categories. |
| GET | `/api/admin/categories/:id` | JWT | Any admin | Get category. |
| POST | `/api/admin/categories` | JWT | SUPER_ADMIN, ADMIN | Create category. |
| PATCH | `/api/admin/categories/:id` | JWT | SUPER_ADMIN, ADMIN | Update category. |
| DELETE | `/api/admin/categories/:id` | JWT | SUPER_ADMIN, ADMIN | Soft deactivate category. |

Create request:

```json
{
  "name": "Healing Crystals",
  "slug": "healing-crystals",
  "description": "Natural crystals traditionally associated with mindful routines",
  "priority": 10,
  "isActive": true
}
```

Common errors:

- `CATEGORY_NOT_FOUND`
- `SLUG_CONFLICT`
- `FORBIDDEN`

## Admin Products

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/products` | JWT | Any admin | List products with filters. |
| GET | `/api/admin/products/:id` | JWT | Any admin | Get product detail. |
| POST | `/api/admin/products` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Create product. |
| PATCH | `/api/admin/products/:id` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Update product. |
| PATCH | `/api/admin/products/:id/status` | JWT | SUPER_ADMIN, ADMIN | Update product status. |
| DELETE | `/api/admin/products/:id` | JWT | SUPER_ADMIN, ADMIN | Soft deactivate product by setting `INACTIVE`. |

List query:

- `page`
- `limit`
- `search`
- `status`
- `categoryId`
- `sort`

Create request:

```json
{
  "name": "Rose Quartz Bracelet",
  "slug": "rose-quartz-bracelet",
  "sku": "BRAC-RQ-001",
  "shortDescription": "Traditionally associated with love and emotional balance.",
  "price": 349,
  "mrp": 499,
  "discountPercent": 30,
  "categoryId": "category_cuid",
  "status": "DRAFT",
  "inventoryQuantity": 80,
  "lowStockThreshold": 5,
  "attributes": {
    "stoneType": "Rose Quartz",
    "intention": ["Love", "Self-Love"]
  }
}
```

Status request:

```json
{ "status": "PUBLISHED" }
```

Common errors:

- `PRODUCT_NOT_FOUND`
- `SLUG_CONFLICT`
- `SKU_CONFLICT`
- `FORBIDDEN`

## Admin Product Images

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/products/:productId/images` | JWT | Any admin | List product images. |
| POST | `/api/admin/products/:productId/images` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Add product image. |
| PATCH | `/api/admin/product-images/:imageId` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Update image metadata. |
| DELETE | `/api/admin/product-images/:imageId` | JWT | SUPER_ADMIN, ADMIN | Delete image. |
| PATCH | `/api/admin/product-images/:imageId/primary` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Mark image as primary. |

Create image request:

```json
{
  "imageUrl": "https://images.example.com/products/rose-detail.webp",
  "thumbnailUrl": "https://images.example.com/products/rose-thumb.webp",
  "cardUrl": "https://images.example.com/products/rose-card.webp",
  "detailUrl": "https://images.example.com/products/rose-detail.webp",
  "storageKey": "products/2026/05/uuid-detail.webp",
  "storageProvider": "r2",
  "mimeType": "image/webp",
  "sizeBytes": 123456,
  "altText": "Rose quartz bracelet on a neutral surface",
  "title": "Rose Quartz Bracelet",
  "width": 1200,
  "height": 1200,
  "sortOrder": 0,
  "isPrimary": true
}
```

Common errors:

- `IMAGE_NOT_FOUND`
- `PRODUCT_NOT_FOUND`

## Admin Collections

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/collections` | JWT | Any admin | List collections. |
| GET | `/api/admin/collections/:id` | JWT | Any admin | Get collection detail with products. |
| POST | `/api/admin/collections` | JWT | SUPER_ADMIN, ADMIN | Create collection. |
| PATCH | `/api/admin/collections/:id` | JWT | SUPER_ADMIN, ADMIN | Update collection. |
| DELETE | `/api/admin/collections/:id` | JWT | SUPER_ADMIN, ADMIN | Soft deactivate collection. |
| POST | `/api/admin/collections/:id/products` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Add one product. |
| POST | `/api/admin/collections/:id/products/bulk` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Add many products. |
| DELETE | `/api/admin/collections/:id/products/:productId` | JWT | SUPER_ADMIN, ADMIN | Remove product from collection. |
| PATCH | `/api/admin/collections/:id/products/:productId/sort-order` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Update collection product sort order. |

Add product request:

```json
{ "productId": "product_cuid", "sortOrder": 3 }
```

Bulk add request:

```json
{ "productIds": ["product_1", "product_2"] }
```

Sort request:

```json
{ "sortOrder": 1 }
```

Common errors:

- `COLLECTION_NOT_FOUND`
- `PRODUCT_NOT_FOUND`
- `PRODUCT_IN_COLLECTION`
- `PRODUCT_NOT_IN_COLLECTION`
- `SLUG_CONFLICT`

## Admin SEO

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/seo` | JWT | Any admin | List SEO metadata. |
| GET | `/api/admin/seo/entity/:entityType/:entityId` | JWT | Any admin | Get by entity. |
| GET | `/api/admin/seo/:id` | JWT | Any admin | Get by id. |
| POST | `/api/admin/seo` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Create SEO metadata. |
| PUT | `/api/admin/seo` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Upsert SEO metadata. |
| PATCH | `/api/admin/seo/:id` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Update SEO metadata. |
| DELETE | `/api/admin/seo/:id` | JWT | SUPER_ADMIN, ADMIN | Delete SEO metadata. |

Create/upsert request:

```json
{
  "entityType": "PRODUCT",
  "entityId": "product_cuid",
  "seoTitle": "Rose Quartz Bracelet | Traditionally Associated with Love",
  "seoDescription": "Natural rose quartz bracelet often chosen for love and emotional balance.",
  "seoKeywords": "rose quartz, bracelet",
  "canonicalUrl": "https://frontend.example.com/products/rose-quartz-bracelet",
  "ogTitle": "Rose Quartz Bracelet",
  "ogDescription": "Safe product description.",
  "ogImageUrl": "https://images.example.com/rose.webp",
  "twitterTitle": "Rose Quartz Bracelet",
  "twitterDescription": "Safe product description.",
  "twitterImageUrl": "https://images.example.com/rose.webp",
  "schemaType": "Product"
}
```

Common errors:

- `SEO_NOT_FOUND`
- `SEO_ENTITY_ID_REQUIRED`

## Admin Coupons

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/coupons` | JWT | Any admin | List coupons. |
| GET | `/api/admin/coupons/:id` | JWT | Any admin | Get coupon. |
| POST | `/api/admin/coupons` | JWT | SUPER_ADMIN, ADMIN | Create coupon. |
| PATCH | `/api/admin/coupons/:id` | JWT | SUPER_ADMIN, ADMIN | Update coupon. |
| DELETE | `/api/admin/coupons/:id` | JWT | SUPER_ADMIN, ADMIN | Deactivate coupon. |

Create request:

```json
{
  "code": "WELCOME10",
  "type": "PERCENTAGE",
  "value": 10,
  "minOrderAmount": 299,
  "maxDiscountAmount": 150,
  "usageLimit": 1000,
  "isActive": true
}
```

Common errors:

- `COUPON_NOT_FOUND`
- `COUPON_CODE_CONFLICT`
- `COUPON_PERCENTAGE_TOO_HIGH`
- `COUPON_DATE_RANGE_INVALID`

## Admin Orders

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/orders` | JWT | Any admin | List orders. |
| GET | `/api/admin/orders/order-number/:orderNumber` | JWT | Any admin | Get order by order number. |
| GET | `/api/admin/orders/:id` | JWT | Any admin | Get order by id. |
| PATCH | `/api/admin/orders/:id/status` | JWT | SUPER_ADMIN, ADMIN | Update order status. |
| PATCH | `/api/admin/orders/:id/cancel` | JWT | SUPER_ADMIN, ADMIN | Cancel order. |

List query:

- `page`
- `limit`
- `search`
- `orderStatus`
- `paymentStatus`
- `fromDate`
- `toDate`

Status request:

```json
{ "status": "PROCESSING", "note": "Packed for shipment" }
```

Cancel request:

```json
{ "note": "Customer requested cancellation" }
```

Common errors:

- `ORDER_NOT_FOUND`
- `INVALID_STATUS_TRANSITION`
- `ORDER_NOT_PAID`
- `FORBIDDEN`

## Admin Inventory

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/inventory` | JWT | Any admin | List inventory state. |
| GET | `/api/admin/inventory/low-stock` | JWT | Any admin | List low/out-of-stock products. |
| PATCH | `/api/admin/inventory/:productId` | JWT | SUPER_ADMIN, ADMIN | Update inventory quantity and threshold. |

Update request:

```json
{
  "inventoryQuantity": 25,
  "lowStockThreshold": 5
}
```

Common errors:

- `PRODUCT_NOT_FOUND`
- validation errors for negative quantity or threshold

## Uploads

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/uploads/image` | JWT | SUPER_ADMIN, ADMIN, EDITOR | Upload and optimize product image. |

Request:

- `multipart/form-data`
- Field name: `file`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Size limit: `MAX_UPLOAD_SIZE_MB`, default 5 MB

Curl:

```bash
curl -X POST http://localhost:8080/api/admin/uploads/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/product.jpg"
```

Success data:

```json
{
  "provider": "local",
  "storageKey": "products/2026/05/uuid-detail.webp",
  "originalUrl": "/uploads/products/2026/05/uuid-original.webp",
  "thumbnailUrl": "/uploads/products/2026/05/uuid-thumb.webp",
  "cardUrl": "/uploads/products/2026/05/uuid-card.webp",
  "detailUrl": "/uploads/products/2026/05/uuid-detail.webp",
  "width": 1200,
  "height": 1200,
  "mimeType": "image/webp",
  "size": 123456
}
```

Common errors:

- `IMAGE_FILE_REQUIRED`
- `INVALID_IMAGE_TYPE`
- `IMAGE_TOO_LARGE`
- `UPLOAD_DRIVER_NOT_CONFIGURED`
- `UNAUTHORIZED`
- `FORBIDDEN`
