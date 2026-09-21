# Admin Backend Guide

## Admin Auth

Login:

```text
POST /api/admin/auth/login
```

The login route:

- validates email and password
- lowercases email before lookup
- rejects inactive admins
- checks bcrypt password hash
- updates `lastLoginAt`
- returns JWT and admin profile without `passwordHash`
- is throttled to 5 requests per minute

Profile:

```text
GET /api/admin/auth/me
```

## JWT Usage

Send the token on protected admin routes:

```http
Authorization: Bearer <accessToken>
```

JWT payload includes:

- `sub`
- `email`
- `name`
- `role`

## Roles

Roles:

- `SUPER_ADMIN`
- `ADMIN`
- `EDITOR`

General behavior:

- Any authenticated admin can read most admin resources.
- SUPER_ADMIN and ADMIN can create/update/delete categories, collections, coupons, inventory, and product status.
- EDITOR can create/update product content, manage product images, manage collection product links, and manage SEO metadata.
- Product delete is a soft deactivate by setting product status to `INACTIVE`.

## Protected Admin Routes

All `/api/admin/*` routes use JWT except:

```text
POST /api/admin/auth/login
```

## Category Management

Routes:

- `GET /api/admin/categories`
- `GET /api/admin/categories/:id`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

Delete deactivates with `isActive = false`.

## Product Management

Routes:

- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `PATCH /api/admin/products/:id/status`
- `DELETE /api/admin/products/:id`

Rules:

- slug must be unique
- SKU must be unique
- status defaults to `DRAFT`
- `publishedAt` is set when product becomes `PUBLISHED`
- stock status is computed from quantity and threshold
- delete sets status to `INACTIVE`

## Product Image Management

Routes:

- `GET /api/admin/products/:productId/images`
- `POST /api/admin/products/:productId/images`
- `PATCH /api/admin/product-images/:imageId`
- `DELETE /api/admin/product-images/:imageId`
- `PATCH /api/admin/product-images/:imageId/primary`

Rules:

- `altText` is required on create.
- First image becomes primary if `isPrimary` is not specified.
- Setting one image primary clears primary state on other images for the product.

## Collection Management

Routes:

- `GET /api/admin/collections`
- `GET /api/admin/collections/:id`
- `POST /api/admin/collections`
- `PATCH /api/admin/collections/:id`
- `DELETE /api/admin/collections/:id`
- `POST /api/admin/collections/:id/products`
- `POST /api/admin/collections/:id/products/bulk`
- `DELETE /api/admin/collections/:id/products/:productId`
- `PATCH /api/admin/collections/:id/products/:productId/sort-order`

Delete deactivates with `isActive = false`.

## SEO Management

Routes:

- `GET /api/admin/seo`
- `GET /api/admin/seo/entity/:entityType/:entityId`
- `GET /api/admin/seo/:id`
- `POST /api/admin/seo`
- `PUT /api/admin/seo`
- `PATCH /api/admin/seo/:id`
- `DELETE /api/admin/seo/:id`

Use safe wording in all SEO fields. Avoid medical and guaranteed spiritual claims.

## Coupon Management

Routes:

- `GET /api/admin/coupons`
- `GET /api/admin/coupons/:id`
- `POST /api/admin/coupons`
- `PATCH /api/admin/coupons/:id`
- `DELETE /api/admin/coupons/:id`

Rules:

- code is uppercased
- percentage value cannot exceed 100
- end date must be after start date
- delete deactivates with `isActive = false`

## Order Management

Routes:

- `GET /api/admin/orders`
- `GET /api/admin/orders/order-number/:orderNumber`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `PATCH /api/admin/orders/:id/cancel`

Rules:

- unpaid orders cannot be marked `SHIPPED` or `DELIVERED`
- normal transitions are enforced
- cancelled orders can only be modified by SUPER_ADMIN
- status changes create `OrderStatusHistory`

## Inventory Management

Routes:

- `GET /api/admin/inventory`
- `GET /api/admin/inventory/low-stock`
- `PATCH /api/admin/inventory/:productId`

Rules:

- quantity and threshold cannot be negative
- status is computed from quantity and threshold
- inventory reduces after payment success, not at order creation

## Upload Management

Route:

```text
POST /api/admin/uploads/image
```

Rules:

- JWT required
- roles: SUPER_ADMIN, ADMIN, EDITOR
- field name: `file`
- allowed MIME: JPEG, PNG, WebP
- returns optimized WebP variants
- local and R2 providers are supported

## Common Admin Workflow

1. Login.
2. Create or select category.
3. Create product as `DRAFT`.
4. Upload image.
5. Save image against product with alt text.
6. Add product to collections.
7. Add SEO metadata.
8. Set inventory.
9. Publish product.
10. Verify public product detail and SEO APIs.
