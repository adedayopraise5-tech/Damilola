export type FragranceFamily =
  | 'Woody'
  | 'Floral'
  | 'Oriental / Amber'
  | 'Fresh'
  | 'Citrus'
  | 'Gourmand'
  | 'Aromatic'
  | 'Musky';

export type GenderPreference = 'Men' | 'Women' | 'Unisex';

export interface ProductSizeOption {
  label: string;
  price: number;
  previousPrice?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  sku?: string;
  category: string;
  fragranceFamily: FragranceFamily;
  gender: GenderPreference;
  concentration?: string;
  price: number;
  previousPrice?: number;
  description: string;
  story?: string;
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  sizes: ProductSizeOption[];
  images: string[];
  stock: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isGiftWorthy?: boolean;
  salesCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  active: boolean;
  updatedAt?: unknown;
}

export interface StoreSettings {
  announcementText: string;
  announcementEnabled: boolean;
  featuredTitle: string;
  featuredSubtitle: string;
  featuredProductIds: string[];
  freeShippingThreshold: number;
  updatedAt?: unknown;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
}

export type PaymentMethod = 'card' | 'cod' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'pending_cod' | 'awaiting_transfer';
export type OrderStatus = 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  giftWrap: boolean;
  giftNote?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderTracker {
  orderCode: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  total: number;
  carrierNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt?: unknown;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  orderCode?: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt?: unknown;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt?: unknown;
}

export interface ShopFilterState {
  category: string;
  brand: string;
  family: string;
  gender: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  newArrivalsOnly: boolean;
  bestSellersOnly: boolean;
  discountedOnly: boolean;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'name-asc';
  searchQuery: string;
}
