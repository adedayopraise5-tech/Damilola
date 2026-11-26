import React, { useEffect, useMemo, useState } from 'react';
import { Check, Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  IMG_AMBER_OIL,
  IMG_CEDAR_BERGAMOT,
  IMG_GIFT_COFFRET,
  IMG_HERO,
  IMG_IVORY_NEROLI,
  IMG_OUD_NOIR,
  IMG_ROSE_VELOURS,
} from '../data/seedCatalog';
import {
  removeCategory,
  removeProduct,
  removeReview,
  resolveInquiry,
  seedInitialCatalogIfEmpty,
  subscribeAllOrders,
  subscribeInquiries,
  subscribeSubscribers,
  updateOrderFulfillment,
  updateStoreSettings,
  upsertCategory,
  upsertProduct,
} from '../lib/firestoreService';
import type {
  Category,
  FragranceFamily,
  GenderPreference,
  Inquiry,
  NewsletterSubscriber,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
} from '../types/store';

type AdminTab = 'products' | 'categories' | 'orders' | 'storefront' | 'engagement';

const IMAGE_PRESETS = [
  { label: 'Oud Noir Flacon', url: IMG_OUD_NOIR },
  { label: 'Ivory Neroli Flacon', url: IMG_IVORY_NEROLI },
  { label: 'Amber Elixir Oil', url: IMG_AMBER_OIL },
  { label: 'Rose Velours Flacon', url: IMG_ROSE_VELOURS },
  { label: 'Cedar & Bergamot', url: IMG_CEDAR_BERGAMOT },
  { label: 'Gift Coffret Box', url: IMG_GIFT_COFFRET },
  { label: 'Chamber Hero Duo', url: IMG_HERO },
];

export const AdminPage: React.FC = () => {
  const {
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    products,
    categories,
    settings,
    reviews,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [syncingSeed, setSyncingSeed] = useState(false);

  // Product editor state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Category editor state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Storefront settings draft
  const [settingsDraft, setSettingsDraft] = useState<StoreSettings>(settings);

  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) return;
    const u1 = subscribeAllOrders(setOrders);
    const u2 = subscribeInquiries(setInquiries);
    const u3 = subscribeSubscribers(setSubscribers);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [isAdmin]);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const openInquiriesCount = useMemo(
    () => inquiries.filter((i) => i.status === 'open').length,
    [inquiries],
  );

  if (!authReady) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center text-sm text-[#2B211B]/70">
        Verifying administration session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
          Store Administration
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#141210] mb-4">
          Admin Sign-In Required
        </h1>
        <p className="text-sm text-[#2B211B]/75 mb-8">
          Authenticate with your authorized administrator Google account to manage
          catalog fragrances, categories, orders, and storefront configuration.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="px-8 py-4 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
          Access Restricted
        </p>
        <h1 className="font-serif text-3xl font-medium text-[#141210] mb-3">
          Administrator Privileges Required
        </h1>
        <p className="text-sm text-[#2B211B]/75">
          Signed in as <span className="font-medium">{user.email}</span>. Only authorized
          Fragrance Chamber Concept administrators can edit store inventory and orders.
        </p>
      </div>
    );
  }

  const handleSeedCatalog = async () => {
    setSyncingSeed(true);
    try {
      const seeded = await seedInitialCatalogIfEmpty();
      showToast(
        seeded
          ? 'Starter catalog synchronized to Firestore.'
          : 'Firestore catalog is already initialized.',
      );
    } catch {
      showToast('Failed to synchronize starter catalog.');
    } finally {
      setSyncingSeed(false);
    }
  };

  const openBlankProduct = () => {
    const id = `prod-${Date.now()}`;
    setIsNewProduct(true);
    setEditingProduct({
      id,
      slug: id,
      name: '',
      brand: 'Maison Chamber',
      sku: '',
      category: categories[0]?.name || 'Niche Fragrances',
      fragranceFamily: 'Woody',
      gender: 'Unisex',
      concentration: 'Eau de Parfum · 22%',
      price: 185,
      description: '',
      story: '',
      topNotes: [],
      heartNotes: [],
      baseNotes: [],
      sizes: [{ label: '100ml', price: 185 }],
      images: [IMG_OUD_NOIR],
      stock: 20,
      isNewArrival: true,
      isBestSeller: false,
      isFeatured: false,
      isGiftWorthy: false,
      salesCount: 0,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim() || !editingProduct.description.trim()) {
      showToast('Product name and description are required.');
      return;
    }
    try {
      await upsertProduct(editingProduct, isNewProduct);
      showToast(`${editingProduct.name} saved to Firestore.`);
      setEditingProduct(null);
    } catch {
      showToast('Could not save product. Check required fields.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      await removeProduct(product.id);
      showToast(`Removed ${product.name}.`);
    } catch {
      showToast('Could not delete product.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await upsertCategory(editingCategory);
      showToast(`Category "${editingCategory.name}" saved.`);
      setEditingCategory(null);
    } catch {
      showToast('Failed to save category.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStoreSettings(settingsDraft);
      showToast('Storefront configuration updated.');
    } catch {
      showToast('Failed to update storefront settings.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E8DFD1] pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-1">
            Boutique Management
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#141210]">
            Fragrance Chamber Admin
          </h1>
        </div>
        <button
          type="button"
          onClick={handleSeedCatalog}
          disabled={syncingSeed}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E8DFD1] text-xs uppercase tracking-[0.14em] hover:border-[#141210] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingSeed ? 'animate-spin' : ''}`} />
          <span>Sync Catalog to Firestore</span>
        </button>
      </div>

      {/* Live Storefront Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/65">
            Active Catalog
          </p>
          <p className="font-serif text-3xl mt-1 tabular-nums">{products.length}</p>
        </div>
        <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/65">
            Total Orders
          </p>
          <p className="font-serif text-3xl mt-1 tabular-nums">{orders.length}</p>
        </div>
        <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/65">
            Recorded Revenue
          </p>
          <p className="font-serif text-3xl mt-1 tabular-nums">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/65">
            Open Inquiries
          </p>
          <p className="font-serif text-3xl mt-1 tabular-nums">{openInquiriesCount}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8DFD1] pb-4">
        {[
          { id: 'products', label: 'Products' },
          { id: 'categories', label: 'Categories' },
          { id: 'orders', label: 'Orders' },
          { id: 'storefront', label: 'Announcement & Featured' },
          { id: 'engagement', label: 'Reviews, Inquiries & Circle' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                : 'border-[#E8DFD1] text-[#2B211B] hover:border-[#141210]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium">Catalog Inventory</h2>
            <button
              type="button"
              onClick={openBlankProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.16em] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fragrance</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E8DFD1]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F3EDE2] text-xs uppercase tracking-[0.14em] text-[#2B211B]/75">
                <tr>
                  <th className="px-4 py-3">Fragrance</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Family</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD1]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F3EDE2]/35">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#141210]">{p.name}</p>
                      <p className="text-xs text-[#2B211B]/65">{p.brand}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{p.category}</td>
                    <td className="px-4 py-3 text-xs">{p.fragranceFamily}</td>
                    <td className="px-4 py-3 tabular-nums">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                    <td className="px-4 py-3 text-xs text-[#2B211B]/75">
                      {[
                        p.isNewArrival && 'New',
                        p.isBestSeller && 'Best Seller',
                        p.isFeatured && 'Featured',
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Standard'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewProduct(false);
                            setEditingProduct(p);
                          }}
                          aria-label={`Edit ${p.name}`}
                          className="p-1.5 border border-[#E8DFD1] hover:border-[#141210] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p)}
                          aria-label={`Delete ${p.name}`}
                          className="p-1.5 border border-[#E8DFD1] hover:border-red-700 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingProduct && (
            <form
              onSubmit={handleSaveProduct}
              className="border border-[#E8DFD1] bg-[#F3EDE2]/55 p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-3">
                <h3 className="font-serif text-2xl">
                  {isNewProduct ? 'New Fragrance Creation' : `Edit ${editingProduct.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        name,
                        slug: isNewProduct
                          ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || editingProduct.id
                          : editingProduct.slug,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Fragrance Family
                  </label>
                  <select
                    value={editingProduct.fragranceFamily}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        fragranceFamily: e.target.value as FragranceFamily,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                  >
                    {[
                      'Woody',
                      'Floral',
                      'Oriental / Amber',
                      'Fresh',
                      'Citrus',
                      'Gourmand',
                      'Aromatic',
                      'Musky',
                    ].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Gender
                  </label>
                  <select
                    value={editingProduct.gender}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        gender: e.target.value as GenderPreference,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                  >
                    {['Unisex', 'Men', 'Women'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const updatedSizes = [...editingProduct.sizes];
                      if (updatedSizes[0]) updatedSizes[0] = { ...updatedSizes[0], price: p };
                      setEditingProduct({ ...editingProduct, price: p, sizes: updatedSizes });
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Studio Photograph Preset
                  </label>
                  <select
                    value={editingProduct.images[0] || IMG_OUD_NOIR}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [e.target.value, ...editingProduct.images.slice(1)],
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                  >
                    {IMAGE_PRESETS.map((preset) => (
                      <option key={preset.url} value={preset.url}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                    Previous Price (Optional discount comparison)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.previousPrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        previousPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.12em] mb-1">
                  Description (min 10 chars) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                {[
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                  { key: 'isFeatured', label: 'Featured Collection' },
                  { key: 'isGiftWorthy', label: 'Gift Recommended' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct[key as keyof Product])}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          [key]: e.target.checked,
                        })
                      }
                      className="accent-[#141210]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="px-7 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
              >
                Save Fragrance
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium">Storefront Categories</h2>
            <button
              type="button"
              onClick={() =>
                setEditingCategory({
                  id: `cat-${Date.now()}`,
                  name: '',
                  slug: `cat-${Date.now()}`,
                  description: '',
                  image: IMG_IVORY_NEROLI,
                  displayOrder: categories.length + 1,
                  active: true,
                })
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.16em] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-serif text-xl">{cat.name}</p>
                  <p className="text-xs text-[#2B211B]/70 mt-1">{cat.description}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#B69354] mt-2">
                    Order {cat.displayOrder} · {cat.active ? 'Visible' : 'Hidden'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="p-2 border border-[#E8DFD1] hover:border-[#141210] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeCategory(cat.id)}
                    className="p-2 border border-[#E8DFD1] hover:border-red-700 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingCategory && (
            <form
              onSubmit={handleSaveCategory}
              className="border border-[#E8DFD1] bg-[#F3EDE2]/55 p-6 space-y-4"
            >
              <h3 className="font-serif text-2xl">Edit Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    })
                  }
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                />
                <input
                  type="number"
                  min="0"
                  value={editingCategory.displayOrder}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      displayOrder: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums"
                />
                <select
                  value={editingCategory.image}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, image: e.target.value })
                  }
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
                >
                  {IMAGE_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Brief Editorial Description"
                value={editingCategory.description}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCategory.active}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, active: e.target.checked })
                  }
                  className="accent-[#141210]"
                />
                <span>Show on Storefront</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.16em] cursor-pointer"
                >
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-2.5 border border-[#E8DFD1] text-xs uppercase tracking-[0.16em] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <h2 className="font-serif text-2xl font-medium">Customer Orders</h2>
          {orders.length === 0 ? (
            <div className="border border-[#E8DFD1] bg-[#F3EDE2]/40 p-8 text-sm text-[#2B211B]/75">
              No customer orders have been placed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-1">
                    <p className="font-serif text-xl tabular-nums">
                      {order.orderCode} · ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#2B211B]/80">
                      {order.customerName} ({order.customerEmail}) · {order.city},{' '}
                      {order.country}
                    </p>
                    <p className="text-xs text-[#2B211B]/70">
                      {order.items
                        .map((i) => `${i.name} (${i.sizeLabel} × ${i.quantity})`)
                        .join(' · ')}
                    </p>
                    {order.giftNote && (
                      <p className="text-xs italic text-[#B69354]">
                        Gift Note: “{order.giftNote}”
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        const next = e.target.value as OrderStatus;
                        await updateOrderFulfillment(
                          order,
                          next,
                          `Order status updated to ${next}.`,
                        );
                        showToast(`${order.orderCode} marked as ${next}.`);
                      }}
                      className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD1] text-xs uppercase tracking-[0.12em]"
                    >
                      {['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STOREFRONT CONFIG */}
      {activeTab === 'storefront' && (
        <form
          onSubmit={handleSaveSettings}
          className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-7 space-y-6 max-w-3xl"
        >
          <h2 className="font-serif text-2xl font-medium">
            Announcement Bar & Featured Collection
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={settingsDraft.announcementEnabled}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    announcementEnabled: e.target.checked,
                  })
                }
                className="accent-[#141210]"
              />
              <span>Display Announcement Bar</span>
            </label>
            <input
              type="text"
              required
              value={settingsDraft.announcementText}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, announcementText: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] mb-1.5">
                Featured Collection Title
              </label>
              <input
                type="text"
                required
                value={settingsDraft.featuredTitle}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, featuredTitle: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] mb-1.5">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                min="0"
                required
                value={settingsDraft.freeShippingThreshold}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] mb-1.5">
              Featured Collection Subtitle
            </label>
            <textarea
              rows={2}
              required
              value={settingsDraft.featuredSubtitle}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, featuredSubtitle: e.target.value })
              }
              className="w-full p-3 bg-[#FAF7F2] border border-[#E8DFD1] text-sm"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.14em] mb-2">
              Featured Products (Select up to 3)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {products.map((p) => {
                const selected = settingsDraft.featuredProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const nextIds = e.target.checked
                          ? [...settingsDraft.featuredProductIds, p.id].slice(0, 6)
                          : settingsDraft.featuredProductIds.filter((id) => id !== p.id);
                        setSettingsDraft({ ...settingsDraft, featuredProductIds: nextIds });
                      }}
                      className="accent-[#141210]"
                    />
                    <span>{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="px-7 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            Save Storefront Settings
          </button>
        </form>
      )}

      {/* TAB 5: REVIEWS, INQUIRIES & SUBSCRIBERS */}
      {activeTab === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-medium">
              Genuine Customer Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-6 text-sm text-[#2B211B]/80">
                <p className="font-medium text-[#141210] mb-1">
                  Admin Testimonial Preview State
                </p>
                <p>
                  No genuine customer reviews have been submitted yet. The homepage
                  Testimonials section remains hidden on the published boutique until real
                  reviews are posted.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-4 flex justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {rev.authorName} · {rev.productName} ({rev.rating}/5)
                      </p>
                      <p className="text-xs text-[#2B211B]/80 mt-1">{rev.comment}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeReview(rev.id)}
                      className="text-[#2B211B]/60 hover:text-red-700 p-1 cursor-pointer self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h2 className="font-serif text-2xl font-medium pt-4">
              Fragrance Circle Subscribers ({subscribers.length})
            </h2>
            {subscribers.length === 0 ? (
              <p className="text-sm text-[#2B211B]/70">No newsletter signups yet.</p>
            ) : (
              <div className="border border-[#E8DFD1] divide-y divide-[#E8DFD1] bg-[#F3EDE2]/30">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="px-4 py-2.5 text-sm">
                    {sub.email}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-medium">
              Client Inquiries ({inquiries.length})
            </h2>
            {inquiries.length === 0 ? (
              <p className="text-sm text-[#2B211B]/70">No client inquiries received yet.</p>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-[#141210]">
                          {inq.subject}
                        </p>
                        <p className="text-xs text-[#2B211B]/70">
                          {inq.name} · {inq.email}
                          {inq.orderCode ? ` · Ref ${inq.orderCode}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void resolveInquiry(
                            inq.id,
                            inq.status === 'open' ? 'resolved' : 'open',
                          )
                        }
                        className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] uppercase tracking-[0.12em] border cursor-pointer ${
                          inq.status === 'resolved'
                            ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                            : 'border-[#E8DFD1] text-[#141210]'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{inq.status}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#2B211B]/85 leading-relaxed">
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
