# API Flow Examples

These flows use the implemented API paths. Replace IDs, slugs, and tokens with values from your database.

## Flow 1: Public Browsing

### 1. Get categories

```bash
curl http://localhost:8080/api/public/categories
```

The response includes only active categories.

### 2. Get products

```bash
curl "http://localhost:8080/api/public/products?page=1&limit=20&sort=priority"
```

The response includes only published products in active categories.

### 3. Get product detail

```bash
curl http://localhost:8080/api/public/products/rose-quartz-bracelet
```

Product detail includes:

- category
- images
- primaryImage
- attributes
- seoMetadata

### 4. Get SEO metadata

```bash
curl http://localhost:8080/api/public/seo/product/rose-quartz-bracelet
```

### 5. Get JSON-LD

```bash
curl http://localhost:8080/api/public/seo/product-schema/rose-quartz-bracelet
```

### 6. Get sitemap data

```bash
curl http://localhost:8080/api/public/sitemap-data
```

Frontend can use these URLs to generate sitemap XML.

## Flow 2: Admin Product Creation

### 1. Admin login

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0, 'utf8')).data.accessToken")
```

### 2. Create category

```bash
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Crystal Bracelets",
    "slug": "crystal-bracelets",
    "description": "Bracelets with natural stones often chosen for mindful routines",
    "priority": 10,
    "isActive": true
  }'
```

### 3. Create product

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rose Quartz Bracelet",
    "slug": "rose-quartz-bracelet",
    "sku": "BRAC-RQ-001",
    "shortDescription": "Traditionally associated with love and emotional balance.",
    "price": 349,
    "mrp": 499,
    "discountPercent": 30,
    "categoryId": "category_cuid",
    "inventoryQuantity": 80,
    "lowStockThreshold": 5,
    "status": "DRAFT",
    "attributes": {
      "stoneType": "Rose Quartz",
      "intention": ["Love", "Self-Love"]
    }
  }'
```

### 4. Upload image

```bash
curl -X POST http://localhost:8080/api/admin/uploads/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/rose-quartz.jpg"
```

Save the returned `detailUrl`, `thumbnailUrl`, `cardUrl`, `storageKey`, `width`, `height`, `mimeType`, and `size`.

### 5. Add product image

```bash
curl -X POST http://localhost:8080/api/admin/products/product_cuid/images \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.example.com/products/2026/05/uuid-detail.webp",
    "thumbnailUrl": "https://images.example.com/products/2026/05/uuid-thumb.webp",
    "cardUrl": "https://images.example.com/products/2026/05/uuid-card.webp",
    "detailUrl": "https://images.example.com/products/2026/05/uuid-detail.webp",
    "storageKey": "products/2026/05/uuid-detail.webp",
    "storageProvider": "r2",
    "mimeType": "image/webp",
    "sizeBytes": 123456,
    "altText": "Rose quartz bracelet on a neutral surface",
    "width": 1200,
    "height": 1200,
    "isPrimary": true
  }'
```

### 6. Create or update SEO metadata

```bash
curl -X PUT http://localhost:8080/api/admin/seo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "PRODUCT",
    "entityId": "product_cuid",
    "seoTitle": "Rose Quartz Bracelet | Traditionally Associated with Love",
    "seoDescription": "Natural rose quartz bracelet often chosen for love and emotional balance.",
    "schemaType": "Product"
  }'
```

### 7. Publish product

```bash
curl -X PATCH http://localhost:8080/api/admin/products/product_cuid/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PUBLISHED"}'
```

### 8. Verify public visibility

```bash
curl http://localhost:8080/api/public/products/rose-quartz-bracelet
```

## Flow 3: Cart to Payment

### 1. Add product to cart

```bash
curl -X POST http://localhost:8080/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "guest-session-id",
    "productId": "product_cuid",
    "quantity": 2,
    "userEmail": "buyer@example.com",
    "userPhone": "+911234567890"
  }'
```

### 2. Get cart

```bash
curl http://localhost:8080/api/cart/guest-session-id
```

### 3. Validate coupon

```bash
curl -X POST http://localhost:8080/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","sessionId":"guest-session-id"}'
```

### 4. Create order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "guest-session-id",
    "customerName": "Test Buyer",
    "customerEmail": "buyer@example.com",
    "customerPhone": "+911234567890",
    "shippingAddress": {
      "line1": "123 Test Street",
      "city": "Mumbai",
      "state": "MH",
      "pincode": "400001",
      "country": "India"
    }
  }'
```

Initial order state:

- `orderStatus`: `PENDING_PAYMENT`
- `paymentStatus`: `PENDING`

### 5. Create payment

```bash
curl -X POST http://localhost:8080/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{"orderNumber":"ORD-20260516-000001"}'
```

### 6. Verify payment

```bash
curl -X POST http://localhost:8080/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD-20260516-000001",
    "mockPaymentId": "mock_pay_xxx"
  }'
```

Successful verification:

- `Payment.status` becomes `SUCCESS`.
- `Order.paymentStatus` becomes `SUCCESS`.
- `Order.orderStatus` becomes `CONFIRMED`.
- Product inventory decrements once.
- Stock status recalculates.
- Cart items clear once.

### 7. Check payment status

```bash
curl http://localhost:8080/api/payments/status/ORD-20260516-000001
```

## Flow 4: Inventory Management

### 1. Update stock

```bash
curl -X PATCH http://localhost:8080/api/admin/inventory/product_cuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventoryQuantity":5,"lowStockThreshold":5}'
```

Stock rules:

- `0` becomes `OUT_OF_STOCK`.
- `<= lowStockThreshold` becomes `LOW_STOCK`.
- Otherwise becomes `IN_STOCK`.

### 2. Get low stock

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/admin/inventory/low-stock
```

Out-of-stock products cannot be added to cart.

## Flow 5: Coupon Usage

### 1. Create coupon

```bash
curl -X POST http://localhost:8080/api/admin/coupons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "type": "PERCENTAGE",
    "value": 10,
    "minOrderAmount": 299,
    "maxDiscountAmount": 150,
    "isActive": true
  }'
```

### 2. Validate coupon

```bash
curl -X POST http://localhost:8080/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"welcome10","sessionId":"guest-session-id"}'
```

Coupon codes are normalized to uppercase.

### 3. Apply to cart/order

Validation stores `couponCode` on the cart. Cart totals and order totals then include `discountAmount`. A `FREE_SHIPPING` coupon sets shipping to zero.
