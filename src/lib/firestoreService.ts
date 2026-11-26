import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { DEFAULT_STORE_SETTINGS, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/seedCatalog';
import type {
  Category,
  Inquiry,
  NewsletterSubscriber,
  Order,
  OrderStatus,
  OrderTracker,
  Product,
  Review,
  StoreSettings,
} from '../types/store';

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

function buildProductPayload(product: Product, isNew: boolean) {
  const payload: Record<string, unknown> = {
    id: product.id,
    slug: product.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 128),
    name: product.name.trim().slice(0, 120),
    brand: product.brand.trim().slice(0, 80),
    category: product.category.trim().slice(0, 60),
    fragranceFamily: product.fragranceFamily,
    gender: product.gender,
    price: Number(product.price),
    description: product.description.trim().slice(0, 2000),
    sizes: product.sizes.slice(0, 10).map((s) => {
      const sizeObj: Record<string, unknown> = { label: s.label, price: Number(s.price) };
      if (typeof s.previousPrice === 'number' && s.previousPrice > 0) {
        sizeObj.previousPrice = Number(s.previousPrice);
      }
      return sizeObj;
    }),
    images: product.images.slice(0, 10),
    stock: Math.max(0, Math.round(Number(product.stock))),
    isNewArrival: Boolean(product.isNewArrival),
    isBestSeller: Boolean(product.isBestSeller),
    isFeatured: Boolean(product.isFeatured),
    isGiftWorthy: Boolean(product.isGiftWorthy),
    salesCount: Math.max(0, Math.round(Number(product.salesCount ?? 0))),
    updatedAt: serverTimestamp(),
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
  } else if (product.createdAt) {
    payload.createdAt = product.createdAt;
  } else {
    payload.createdAt = serverTimestamp();
  }

  if (product.sku && product.sku.trim()) {
    payload.sku = product.sku.trim().slice(0, 40);
  }
  if (product.concentration && product.concentration.trim()) {
    payload.concentration = product.concentration.trim().slice(0, 60);
  }
  if (typeof product.previousPrice === 'number' && product.previousPrice > 0) {
    payload.previousPrice = Number(product.previousPrice);
  }
  if (product.story && product.story.trim()) {
    payload.story = product.story.trim().slice(0, 2000);
  }
  if (product.topNotes && product.topNotes.length > 0) {
    payload.topNotes = product.topNotes.slice(0, 12);
  }
  if (product.heartNotes && product.heartNotes.length > 0) {
    payload.heartNotes = product.heartNotes.slice(0, 12);
  }
  if (product.baseNotes && product.baseNotes.length > 0) {
    payload.baseNotes = product.baseNotes.slice(0, 12);
  }

  return payload;
}

export function subscribeCatalog(
  onProducts: (products: Product[]) => void,
  onCategories: (categories: Category[]) => void,
  onSettings: (settings: StoreSettings) => void,
  onReviews: (reviews: Review[]) => void,
): Unsubscribe {
  const unsubProducts = onSnapshot(
    collection(db, 'products'),
    (snap) => {
      if (snap.empty) {
        onProducts(INITIAL_PRODUCTS);
      } else {
        const list = snap.docs.map((d) => ({ ...(d.data() as Product), id: d.id }));
        onProducts(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    },
  );

  const unsubCategories = onSnapshot(
    query(collection(db, 'categories'), orderBy('displayOrder', 'asc')),
    (snap) => {
      if (snap.empty) {
        onCategories(INITIAL_CATEGORIES);
      } else {
        const list = snap.docs.map((d) => ({ ...(d.data() as Category), id: d.id }));
        onCategories(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    },
  );

  const unsubSettings = onSnapshot(
    doc(db, 'settings', 'storefront'),
    (snap) => {
      if (!snap.exists()) {
        onSettings(DEFAULT_STORE_SETTINGS);
      } else {
        onSettings(snap.data() as StoreSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/storefront');
    },
  );

  const unsubReviews = onSnapshot(
    query(collection(db, 'reviews'), orderBy('createdAt', 'desc')),
    (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id }));
      onReviews(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    },
  );

  return () => {
    unsubProducts();
    unsubCategories();
    unsubSettings();
    unsubReviews();
  };
}

export async function seedInitialCatalogIfEmpty(): Promise<boolean> {
  try {
    const existingProducts = await getDocs(collection(db, 'products'));
    if (!existingProducts.empty) {
      return false;
    }

    const batch = writeBatch(db);
    for (const prod of INITIAL_PRODUCTS) {
      batch.set(doc(db, 'products', prod.id), buildProductPayload(prod, true));
    }
    for (const cat of INITIAL_CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        displayOrder: cat.displayOrder,
        active: cat.active,
        updatedAt: serverTimestamp(),
      });
    }
    batch.set(doc(db, 'settings', 'storefront'), {
      ...DEFAULT_STORE_SETTINGS,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
}

export async function upsertProduct(product: Product, isNew: boolean): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), buildProductPayload(product, isNew));
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

export async function upsertCategory(category: Category): Promise<void> {
  try {
    await setDoc(doc(db, 'categories', category.id), {
      id: category.id,
      name: category.name.trim().slice(0, 80),
      slug: category.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80),
      description: category.description.trim().slice(0, 240),
      image: category.image.trim().slice(0, 500),
      displayOrder: Math.max(0, Math.round(Number(category.displayOrder))),
      active: Boolean(category.active),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
  }
}

export async function removeCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
  }
}

export async function updateStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'storefront'), {
      announcementText: settings.announcementText.trim().slice(0, 180),
      announcementEnabled: Boolean(settings.announcementEnabled),
      featuredTitle: settings.featuredTitle.trim().slice(0, 100),
      featuredSubtitle: settings.featuredSubtitle.trim().slice(0, 300),
      featuredProductIds: settings.featuredProductIds.slice(0, 12),
      freeShippingThreshold: Math.max(0, Number(settings.freeShippingThreshold)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/storefront');
  }
}

export async function placeOrder(
  orderInput: Omit<Order, 'id' | 'orderCode' | 'status' | 'createdAt' | 'updatedAt'>,
): Promise<{ orderId: string; orderCode: string }> {
  const orderId = makeSafeId('ord');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `FCC-${new Date().getFullYear()}-${suffix}`;
  const batch = writeBatch(db);

  const orderDoc: Record<string, unknown> = {
    id: orderId,
    orderCode,
    userId: orderInput.userId,
    customerName: orderInput.customerName.trim().slice(0, 120),
    customerEmail: orderInput.customerEmail.trim().slice(0, 160),
    customerPhone: orderInput.customerPhone.trim().slice(0, 40),
    shippingAddress: orderInput.shippingAddress.trim().slice(0, 300),
    city: orderInput.city.trim().slice(0, 80),
    postalCode: orderInput.postalCode.trim().slice(0, 24),
    country: orderInput.country.trim().slice(0, 80),
    giftWrap: Boolean(orderInput.giftWrap),
    paymentMethod: orderInput.paymentMethod,
    paymentStatus: orderInput.paymentStatus,
    status: 'confirmed',
    items: orderInput.items.slice(0, 50),
    subtotal: Number(orderInput.subtotal),
    shippingFee: Number(orderInput.shippingFee),
    total: Number(orderInput.total),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (orderInput.giftNote && orderInput.giftNote.trim()) {
    orderDoc.giftNote = orderInput.giftNote.trim().slice(0, 400);
  }

  const trackerDoc: Record<string, unknown> = {
    orderCode,
    userId: orderInput.userId,
    status: 'confirmed',
    paymentStatus: orderInput.paymentStatus,
    itemCount: orderInput.items.reduce((acc, item) => acc + item.quantity, 0),
    total: Number(orderInput.total),
    carrierNote: 'Order received at Fragrance Chamber Atelier.',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  batch.set(doc(db, 'orders', orderId), orderDoc);
  batch.set(doc(db, 'orderTrackers', orderCode), trackerDoc);

  try {
    await batch.commit();
    return { orderId, orderCode };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
  }
}

export async function trackOrderByCode(orderCode: string): Promise<OrderTracker | null> {
  const normalized = orderCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!normalized || normalized.length < 4) return null;
  try {
    const snap = await getDoc(doc(db, 'orderTrackers', normalized));
    if (!snap.exists()) return null;
    return snap.data() as OrderTracker;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `orderTrackers/${normalized}`);
  }
}

export function subscribeUserOrders(userId: string, onOrders: (orders: Order[]) => void): Unsubscribe {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onOrders(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id })));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    },
  );
}

export function subscribeAllOrders(onOrders: (orders: Order[]) => void): Unsubscribe {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onOrders(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id })));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    },
  );
}

export async function updateOrderFulfillment(
  order: Order,
  newStatus: OrderStatus,
  carrierNote?: string,
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'orders', order.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  const trackerUpdate: Record<string, unknown> = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (carrierNote !== undefined) {
    trackerUpdate.carrierNote = carrierNote.trim().slice(0, 240);
  }
  batch.update(doc(db, 'orderTrackers', order.orderCode), trackerUpdate);

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
  }
}

export async function cancelOwnOrder(order: Order): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'orders', order.id), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'orderTrackers', order.orderCode), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
  }
}

export async function submitReview(input: {
  productId: string;
  productName: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
}): Promise<void> {
  const id = makeSafeId('rev');
  try {
    await setDoc(doc(db, 'reviews', id), {
      id,
      productId: input.productId,
      productName: input.productName.trim().slice(0, 120),
      userId: input.userId,
      authorName: input.authorName.trim().slice(0, 80),
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      comment: input.comment.trim().slice(0, 800),
      verifiedPurchase: Boolean(input.verifiedPurchase),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reviews/${id}`);
  }
}

export async function removeReview(reviewId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
  }
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const id = makeSafeId('sub');
  try {
    await setDoc(doc(db, 'newsletterSubscribers', id), {
      email: email.trim().toLowerCase().slice(0, 160),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `newsletterSubscribers/${id}`);
  }
}

export async function submitInquiry(input: {
  name: string;
  email: string;
  orderCode?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const id = makeSafeId('inq');
  const payload: Record<string, unknown> = {
    name: input.name.trim().slice(0, 100),
    email: input.email.trim().slice(0, 160),
    subject: input.subject.trim().slice(0, 140),
    message: input.message.trim().slice(0, 1500),
    status: 'open',
    createdAt: serverTimestamp(),
  };
  if (input.orderCode && input.orderCode.trim()) {
    payload.orderCode = input.orderCode.trim().slice(0, 32);
  }
  try {
    await setDoc(doc(db, 'inquiries', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `inquiries/${id}`);
  }
}

export function subscribeInquiries(onInquiries: (items: Inquiry[]) => void): Unsubscribe {
  const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onInquiries(snap.docs.map((d) => ({ ...(d.data() as Inquiry), id: d.id })));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inquiries');
    },
  );
}

export async function resolveInquiry(inquiryId: string, status: 'open' | 'resolved'): Promise<void> {
  try {
    await updateDoc(doc(db, 'inquiries', inquiryId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inquiries/${inquiryId}`);
  }
}

export function subscribeSubscribers(onSubscribers: (items: NewsletterSubscriber[]) => void): Unsubscribe {
  const q = query(collection(db, 'newsletterSubscribers'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onSubscribers(snap.docs.map((d) => ({ ...(d.data() as NewsletterSubscriber), id: d.id })));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'newsletterSubscribers');
    },
  );
}

export async function syncUserWishlist(
  uid: string,
  wishlist: string[],
  displayName?: string | null,
  email?: string | null,
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    const payload: Record<string, unknown> = {
      uid,
      wishlist: wishlist.slice(0, 100),
      updatedAt: serverTimestamp(),
    };
    if (displayName) payload.displayName = displayName.slice(0, 100);
    if (email) payload.email = email.slice(0, 160);
    if (!snap.exists()) {
      await setDoc(docRef, payload);
    } else {
      await updateDoc(docRef, {
        wishlist: wishlist.slice(0, 100),
        updatedAt: serverTimestamp(),
        ...(displayName ? { displayName: displayName.slice(0, 100) } : {}),
        ...(email ? { email: email.slice(0, 160) } : {}),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

export async function loadUserWishlist(uid: string): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return [];
    const data = snap.data();
    return Array.isArray(data.wishlist) ? (data.wishlist as string[]) : [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}
