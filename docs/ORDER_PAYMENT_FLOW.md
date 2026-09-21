# Order and Payment Flow

## Cart Creation

There is no separate create-cart endpoint. A cart is created automatically when a product is added through:

```text
POST /api/cart/items
```

The cart is keyed by `sessionId`.

## Cart Item Rules

Before adding or updating an item, the service checks:

- product exists
- product status is `PUBLISHED`
- product is not `OUT_OF_STOCK`
- requested quantity does not exceed `inventoryQuantity`
- quantity is at least 1

Cart items store:

- `productId`
- `quantity`
- `priceAtAdd`

## Coupon Validation

Coupon validation endpoint:

```text
POST /api/coupons/validate
```

Rules:

- coupon code is uppercased
- inactive coupons are rejected
- future coupons are rejected
- expired coupons are rejected
- usage-limit-exceeded coupons are rejected
- minimum order amount is enforced
- percentage coupons apply `maxDiscountAmount`
- fixed amount coupons cannot discount more than order amount
- free shipping coupons return `isFreeShipping = true`

Validation writes `couponCode` to the cart when the cart exists.

## Shipping Calculation

Current code uses constants in both cart and order services:

- free shipping threshold: `499`
- shipping amount: `49`

`DEFAULT_SHIPPING_AMOUNT` is not currently implemented as an environment variable.

## Order Creation from Cart

Endpoint:

```text
POST /api/orders
```

Order creation:

1. Loads cart by `sessionId`.
2. Requires cart to exist and contain items.
3. Revalidates each product status and stock.
4. Calculates subtotal from `priceAtAdd`.
5. Revalidates coupon if present.
6. Calculates `discountAmount`, `shippingAmount`, and `grandTotal`.
7. Generates order number in format `ORD-yyyyMMdd-000001`.
8. Creates order and order items in a transaction.
9. Increments coupon `usedCount` if coupon was present.
10. Updates cart contact fields with order email/phone.

Initial state:

- `paymentStatus`: `PENDING`
- `orderStatus`: `PENDING_PAYMENT`

## Order Item Price Snapshot

`OrderItem` stores:

- product id
- product name
- sku
- image URL
- price at purchase
- quantity
- subtotal

This protects order history from later product price or name changes.

## Mock Payment Creation

Endpoint:

```text
POST /api/payments/create
```

Request:

```json
{ "orderNumber": "ORD-20260516-000001" }
```

Behavior:

- loads order by `orderNumber`
- returns already-paid state if `paymentStatus` is `SUCCESS`
- calls mock gateway
- creates `Payment` row with `PENDING`
- stores provider ids and raw response

## Mock Payment Verification

Endpoint:

```text
POST /api/payments/verify
```

Request:

```json
{
  "orderNumber": "ORD-20260516-000001",
  "mockPaymentId": "mock_pay_xxx"
}
```

Behavior:

- loads order and order items
- returns success immediately if already paid
- finds matching payment row
- verifies with mock gateway
- performs confirmation work in a Prisma transaction

## Payment Idempotency

If an order already has `paymentStatus = SUCCESS`, verification returns success without:

- reducing inventory again
- clearing the cart again
- creating a duplicate confirmation effect

The transaction also uses `updateMany` with `paymentStatus != SUCCESS` to avoid double-processing during concurrent verification.

## Inventory Decrement Rules

Inventory reduces only after successful payment verification.

For each order item:

1. Check current inventory is enough.
2. Decrement product inventory.
3. Recalculate stock status:
   - `0` -> `OUT_OF_STOCK`
   - `<= lowStockThreshold` -> `LOW_STOCK`
   - otherwise -> `IN_STOCK`

## Cart Clear Rules

After successful payment verification, the service looks up a cart by `customerEmail`, deletes cart items, and clears `couponCode`.

Note: This means reliable cart clearing depends on cart/order email matching.

## Payment and Order Statuses

Payment statuses:

- `PENDING`
- `SUCCESS`
- `FAILED`
- `REFUNDED`

Order statuses:

- `PENDING_PAYMENT`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`
- `FAILED`

Admin status transitions are enforced by `AdminOrdersService`.

## Important Production Rule

Frontend should not mark an order as paid directly.

In production, the backend should confirm payment through a verified payment gateway callback or webhook. The frontend can start payment and show status, but the backend must own the final payment confirmation.

## Future Real Payment Gateway Notes

The payment module already has:

- `payment-gateway.interface.ts`
- `mock-payment.gateway.ts`

To add a real gateway:

1. Implement the gateway interface.
2. Store provider order/payment ids.
3. Add webhook verification.
4. Keep idempotent confirmation logic.
5. Confirm inventory and order state inside a transaction.
6. Do not trust client-only payment success messages.
