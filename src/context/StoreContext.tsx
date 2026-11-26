import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, db, googleProvider } from '../lib/firebase';
import {
  loadUserWishlist,
  seedInitialCatalogIfEmpty,
  subscribeCatalog,
  syncUserWishlist,
} from '../lib/firestoreService';
import { DEFAULT_STORE_SETTINGS, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/seedCatalog';
import type {
  CartItem,
  Category,
  Order,
  Product,
  Review,
  ShopFilterState,
  StoreSettings,
} from '../types/store';

export const DEFAULT_FILTERS: ShopFilterState = {
  category: 'All',
  brand: 'All',
  family: 'All',
  gender: 'All',
  size: 'All',
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,
  newArrivalsOnly: false,
  bestSellersOnly: false,
  discountedOnly: false,
  sortBy: 'featured',
  searchQuery: '',
};

interface StoreContextValue {
  route: string;
  navigate: (to: string) => void;
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  reviews: Review[];
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  giftWrap: boolean;
  setGiftWrap: (val: boolean) => void;
  addToCart: (product: Product, sizeLabel?: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, sizeLabel: string, quantity: number) => void;
  removeFromCart: (productId: string, sizeLabel: string) => void;
  clearCart: () => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistDrawerOpen: boolean;
  setWishlistDrawerOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  shopFilters: ShopFilterState;
  setShopFilters: React.Dispatch<React.SetStateAction<ShopFilterState>>;
  openShopWithFilter: (partial: Partial<ShopFilterState>) => void;
  lastConfirmedOrder: Order | null;
  setLastConfirmedOrder: (order: Order | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'fcc_cart_v1';
const WISHLIST_STORAGE_KEY = 'fcc_wishlist_v1';

function readHashRoute(): string {
  const h = window.location.hash;
  if (!h || h === '#') return '/';
  return h.startsWith('#') ? h.slice(1) : h;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<string>(readHashRoute);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [giftWrap, setGiftWrap] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [shopFilters, setShopFilters] = useState<ShopFilterState>(DEFAULT_FILTERS);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readHashRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const clean = to.startsWith('/') ? to : `/${to}`;
    window.location.hash = `#${clean}`;
    setRoute(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const unsub = subscribeCatalog(setProducts, setCategories, setSettings, setReviews);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      let adminFlag =
        Boolean(currentUser.emailVerified) &&
        currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

      if (!adminFlag && currentUser.emailVerified) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
          adminFlag = adminSnap.exists();
        } catch {
          adminFlag = false;
        }
      }

      setIsAdmin(adminFlag);
      setAuthReady(true);

      if (adminFlag) {
        void seedInitialCatalogIfEmpty().catch(() => undefined);
      }

      try {
        const remoteWishlist = await loadUserWishlist(currentUser.uid);
        if (remoteWishlist.length > 0) {
          setWishlist((prev) => Array.from(new Set([...prev, ...remoteWishlist])));
        }
      } catch {
        // Ignore initial wishlist load error if offline
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlist]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      showToast(`Welcome back, ${cred.user.displayName || 'Guest'}.`);
      return cred.user;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      showToast('Sign-in was cancelled or blocked.');
      return null;
    }
  }, [showToast]);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
    showToast('You have signed out.');
  }, [showToast]);

  const addToCart = useCallback(
    (product: Product, sizeLabel?: string, quantity = 1) => {
      const selectedSize =
        product.sizes.find((s) => s.label === sizeLabel) ?? product.sizes[0];
      if (!selectedSize) return;

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === product.id && item.sizeLabel === selectedSize.label,
        );
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity,
          };
          return next;
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.images[0] || '',
            sizeLabel: selectedSize.label,
            unitPrice: selectedSize.price,
            quantity,
          },
        ];
      });
      setCartDrawerOpen(true);
    },
    [],
  );

  const updateCartQuantity = useCallback(
    (productId: string, sizeLabel: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) =>
          prev.filter(
            (item) => !(item.productId === productId && item.sizeLabel === sizeLabel),
          ),
        );
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId && item.sizeLabel === sizeLabel
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, sizeLabel: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.sizeLabel === sizeLabel),
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setGiftWrap(false);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
        if (user) {
          void syncUserWishlist(user.uid, next, user.displayName, user.email).catch(
            () => undefined,
          );
        }
        showToast(exists ? 'Removed from wishlist.' : 'Saved to wishlist.');
        return next;
      });
    },
    [user, showToast],
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const openShopWithFilter = useCallback(
    (partial: Partial<ShopFilterState>) => {
      setShopFilters({ ...DEFAULT_FILTERS, ...partial });
      navigate('/shop');
    },
    [navigate],
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart],
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const value: StoreContextValue = {
    route,
    navigate,
    products,
    categories,
    settings,
    reviews,
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    signOut,
    cart,
    cartCount,
    cartSubtotal,
    giftWrap,
    setGiftWrap,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartDrawerOpen,
    setCartDrawerOpen,
    wishlist,
    toggleWishlist,
    isWishlisted,
    wishlistDrawerOpen,
    setWishlistDrawerOpen,
    searchOpen,
    setSearchOpen,
    quickViewProduct,
    setQuickViewProduct,
    shopFilters,
    setShopFilters,
    openShopWithFilter,
    lastConfirmedOrder,
    setLastConfirmedOrder,
    toastMessage,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
