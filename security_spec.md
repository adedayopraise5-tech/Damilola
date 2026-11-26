# Fragrance Chamber Concept — Security Specification

## 1. Data Invariants
1. **Product & Category Integrity**: Only verified admins (`isAdmin()`) may create, update, or delete `/products/{productId}`, `/categories/{categoryId}`, and `/settings/{settingId}`.
2. **Order Ownership & Atomicity**: An order in `/orders/{orderId}` can only be created by an authenticated, email-verified user whose `userId == request.auth.uid`, accompanied atomically by a matching PII-free `/orderTrackers/{orderCode}` document (`existsAfter` / `getAfter`).
3. **Terminal Status Locking**: Once an order reaches `delivered` or `cancelled`, non-admin users cannot mutate the order. Only admins may advance or override order statuses.
4. **PII Isolation**: `/orders`, `/users`, `/newsletterSubscribers`, and `/inquiries` contain customer PII (`email`, `phone`, `shippingAddress`). No blanket `allow read` or `allow list` is permitted; reads are strictly confined to `isOwner` or `isAdmin()`.
5. **PII-Free Order Tracking**: `/orderTrackers/{orderCode}` contains zero PII and allows single-document `get` by exact `orderCode`, prohibiting unauthenticated `list` scraping.
6. **Genuine Review Integrity**: Reviews in `/reviews/{reviewId}` require `request.auth.uid == incoming().userId`, integer rating between 1 and 5, and existing product reference (`exists(/databases/$(database)/documents/products/$(incoming().productId))`).
7. **Self-Role Escalation Prevention**: Users may never write to `/admins/{userId}` unless already an admin, and `/users/{userId}` enforces strict `keys().hasOnly(...)` excluding any `role` or `isAdmin` field.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on User Profile**: `{ "uid": "u1", "wishlist": [], "updatedAt": "server", "isAdmin": true }` -> `PERMISSION_DENIED` (`hasOnly` rejects `isAdmin`).
2. **Identity Spoofing on Order Creation**: Signed in as `u1`, creating `/orders/ord_1` with `"userId": "u2"` -> `PERMISSION_DENIED`.
3. **Unverified Email Spoofing Admin**: Token has `email: "adedayopraise5@gmail.com"` with `email_verified: false` writing to `/products/p1` -> `PERMISSION_DENIED`.
4. **Orphaned Order Without Tracker**: Creating `/orders/ord_1` without synchronous `/orderTrackers/{orderCode}` in batch -> `PERMISSION_DENIED` (`existsAfter` fails).
5. **ID Poisoning**: Document ID of 200 characters or containing `/` or `$` -> `PERMISSION_DENIED` (`isValidId` fails).
6. **Client-Forged Timestamp**: Creating an order with `"createdAt": "2020-01-01T00:00:00Z"` instead of `request.time` -> `PERMISSION_DENIED`.
7. **Terminal State Tampering**: Updating an order whose existing `status == "delivered"` as a non-admin -> `PERMISSION_DENIED`.
8. **Out-of-Bounds Rating**: Creating a review with `"rating": 99` or `"rating": 0` -> `PERMISSION_DENIED`.
9. **Orphaned Review**: Creating a review for non-existent `"productId": "nonexistent_999"` -> `PERMISSION_DENIED`.
10. **PII Scraping List Query**: Unauthenticated or non-admin listing `/newsletterSubscribers` or `/orders` -> `PERMISSION_DENIED`.
11. **Value Poisoning on Catalog Update**: Non-admin attempting to update `/products/p1` price to `0.01` -> `PERMISSION_DENIED`.
12. **Array Exhaustion**: Submitting `/users/u1` wishlist with 500 items or non-string items -> `PERMISSION_DENIED`.
