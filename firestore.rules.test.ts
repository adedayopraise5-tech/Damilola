/**
 * Payload-First Security Verification Suite for Fragrance Chamber Concept
 * Validates the "Dirty Dozen" adversarial payloads against schema & invariant laws.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  payload: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
  violatedInvariant: string;
}

export const dirtyDozenCases: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on User Profile',
    collection: 'users/u1',
    payload: { uid: 'u1', wishlist: [], updatedAt: 'server', isAdmin: true },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'keys().hasOnly() excludes role/isAdmin privilege fields',
  },
  {
    id: 2,
    name: 'Identity Spoofing on Order Creation',
    collection: 'orders/ord_1',
    payload: { id: 'ord_1', userId: 'victim_uid', status: 'confirmed' },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'incoming().userId == request.auth.uid',
  },
  {
    id: 3,
    name: 'Unverified Email Admin Spoof',
    collection: 'products/prod_1',
    payload: { id: 'prod_1', price: 1 },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'request.auth.token.email_verified == true required in isAdmin()',
  },
  {
    id: 4,
    name: 'Orphaned Order Without Tracker',
    collection: 'orders/ord_2',
    payload: { id: 'ord_2', orderCode: 'FCC-2026-9999', userId: 'u1' },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'existsAfter(/orderTrackers/$(incoming().orderCode)) atomicity gate',
  },
  {
    id: 5,
    name: 'Path Variable ID Poisoning',
    collection: 'products/' + 'a'.repeat(200),
    payload: { id: 'a'.repeat(200) },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'isValidId() enforces <= 128 chars and ^[a-zA-Z0-9_-]+$',
  },
  {
    id: 6,
    name: 'Client-Forged Timestamp',
    collection: 'orders/ord_3',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'incoming().createdAt == request.time',
  },
  {
    id: 7,
    name: 'Terminal State Tampering on Delivered Order',
    collection: 'orders/ord_delivered',
    payload: { status: 'cancelled' },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: '!(existing().status in ["delivered", "cancelled"])',
  },
  {
    id: 8,
    name: 'Out-of-Bounds Review Rating',
    collection: 'reviews/rev_1',
    payload: { id: 'rev_1', rating: 99 },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'data.rating is int && data.rating >= 1 && data.rating <= 5',
  },
  {
    id: 9,
    name: 'Orphaned Review for Non-Existent Product',
    collection: 'reviews/rev_2',
    payload: { id: 'rev_2', productId: 'nonexistent_999', rating: 5 },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'exists(/products/$(incoming().productId))',
  },
  {
    id: 10,
    name: 'PII Scraping List Query on Newsletter',
    collection: 'newsletterSubscribers',
    payload: {},
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'allow list: if isAdmin()',
  },
  {
    id: 11,
    name: 'Unauthorized Catalog Price Mutation',
    collection: 'products/prod_1',
    payload: { price: 0.01 },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'allow update: if isAdmin()',
  },
  {
    id: 12,
    name: 'Wishlist Array Exhaustion',
    collection: 'users/u1',
    payload: { uid: 'u1', wishlist: Array.from({ length: 150 }, (_, i) => `p_${i}`) },
    expectedOutcome: 'PERMISSION_DENIED',
    violatedInvariant: 'data.wishlist.size() <= 100',
  },
];
