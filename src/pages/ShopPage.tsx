import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { DEFAULT_FILTERS, useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const ShopPage: React.FC = () => {
  const { products, categories, shopFilters, setShopFilters } = useStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );

  const families = useMemo(
    () => Array.from(new Set(products.map((p) => p.fragranceFamily))).sort(),
    [products],
  );

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s.label)));
    return Array.from(set);
  }, [products]);

  const activeCategoryTabs = useMemo(
    () => ['All', ...categories.filter((c) => c.active).map((c) => c.name)],
    [categories],
  );

  const hasAnySales = useMemo(
    () => products.some((p) => (p.salesCount ?? 0) > 0),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const minP = shopFilters.minPrice ? Number(shopFilters.minPrice) : null;
    const maxP = shopFilters.maxPrice ? Number(shopFilters.maxPrice) : null;
    const q = shopFilters.searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      if (shopFilters.category !== 'All' && p.category !== shopFilters.category) {
        return false;
      }
      if (shopFilters.brand !== 'All' && p.brand !== shopFilters.brand) {
        return false;
      }
      if (shopFilters.family !== 'All' && p.fragranceFamily !== shopFilters.family) {
        return false;
      }
      if (shopFilters.gender !== 'All' && p.gender !== shopFilters.gender) {
        return false;
      }
      if (
        shopFilters.size !== 'All' &&
        !p.sizes.some((s) => s.label === shopFilters.size)
      ) {
        return false;
      }
      if (minP !== null && !Number.isNaN(minP) && p.price < minP) {
        return false;
      }
      if (maxP !== null && !Number.isNaN(maxP) && p.price > maxP) {
        return false;
      }
      if (shopFilters.inStockOnly && p.stock <= 0) {
        return false;
      }
      if (shopFilters.newArrivalsOnly && !p.isNewArrival) {
        return false;
      }
      if (shopFilters.bestSellersOnly && !p.isBestSeller) {
        return false;
      }
      if (
        shopFilters.discountedOnly &&
        !(typeof p.previousPrice === 'number' && p.previousPrice > p.price)
      ) {
        return false;
      }
      if (q) {
        const hay = [
          p.name,
          p.brand,
          p.category,
          p.fragranceFamily,
          p.description,
          ...(p.topNotes || []),
          ...(p.heartNotes || []),
          ...(p.baseNotes || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      switch (shopFilters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'newest':
          return Number(b.isNewArrival) - Number(a.isNewArrival);
        case 'best-selling':
          return (b.salesCount ?? 0) - (a.salesCount ?? 0);
        case 'featured':
        default:
          return Number(b.isFeatured) - Number(a.isFeatured);
      }
    });
  }, [products, shopFilters]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-3">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[#141210] font-medium">
          Refine Collection
        </h2>
        <button
          type="button"
          onClick={() => setShopFilters(DEFAULT_FILTERS)}
          className="text-xs text-[#B69354] hover:underline cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
          House / Brand
        </label>
        <select
          value={shopFilters.brand}
          onChange={(e) => setShopFilters((prev) => ({ ...prev, brand: e.target.value }))}
          className="w-full px-3 py-2.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm text-[#141210] focus:outline-none focus:border-[#B69354]"
        >
          <option value="All">All Houses</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Fragrance Family */}
      <div>
        <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
          Fragrance Family
        </label>
        <select
          value={shopFilters.family}
          onChange={(e) => setShopFilters((prev) => ({ ...prev, family: e.target.value }))}
          className="w-full px-3 py-2.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm text-[#141210] focus:outline-none focus:border-[#B69354]"
        >
          <option value="All">All Families</option>
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
          Preference
        </p>
        <div className="grid grid-cols-2 gap-2">
          {['All', 'Men', 'Women', 'Unisex'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setShopFilters((prev) => ({ ...prev, gender: g }))}
              className={`py-2 px-3 text-xs border transition-colors cursor-pointer ${
                shopFilters.gender === g
                  ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                  : 'border-[#E8DFD1] text-[#141210] hover:border-[#141210]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
          Bottle Size
        </label>
        <select
          value={shopFilters.size}
          onChange={(e) => setShopFilters((prev) => ({ ...prev, size: e.target.value }))}
          className="w-full px-3 py-2.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm text-[#141210] focus:outline-none focus:border-[#B69354]"
        >
          <option value="All">All Sizes</option>
          {allSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
          Price Range ($)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={shopFilters.minPrice}
            onChange={(e) =>
              setShopFilters((prev) => ({ ...prev, minPrice: e.target.value }))
            }
            className="px-3 py-2 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm tabular-nums focus:outline-none focus:border-[#B69354]"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={shopFilters.maxPrice}
            onChange={(e) =>
              setShopFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
            className="px-3 py-2 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm tabular-nums focus:outline-none focus:border-[#B69354]"
          />
        </div>
      </div>

      {/* Attribute Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-[#E8DFD1]">
        {[
          { key: 'inStockOnly', label: 'In Stock Only' },
          { key: 'newArrivalsOnly', label: 'New Arrivals' },
          { key: 'bestSellersOnly', label: 'Best Sellers' },
          { key: 'discountedOnly', label: 'Special Privilege Pricing' },
        ].map(({ key, label }) => {
          const checked = Boolean(shopFilters[key as keyof typeof shopFilters]);
          return (
            <label key={key} className="flex items-center gap-2.5 text-sm text-[#2B211B] cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  setShopFilters((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
                className="accent-[#141210] w-4 h-4"
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
      {/* Page Header */}
      <div className="border-b border-[#E8DFD1] pb-8 mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
          The Boutique
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141210]">
              {shopFilters.category === 'All' ? 'All Fragrances' : shopFilters.category}
            </h1>
            <p className="mt-2 text-sm text-[#2B211B]/75">
              Find the fragrance that feels like you.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#2B211B]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={shopFilters.searchQuery}
                onChange={(e) =>
                  setShopFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                placeholder="Search scents or notes..."
                aria-label="Search shop"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
              />
            </div>

            <select
              value={shopFilters.sortBy}
              onChange={(e) =>
                setShopFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as typeof prev.sortBy,
                }))
              }
              aria-label="Sort products"
              className="px-3.5 py-2.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              {hasAnySales && <option value="best-selling">Best Selling</option>}
              <option value="name-asc">Name: A to Z</option>
            </select>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-[#141210] text-xs uppercase tracking-[0.14em] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-1">
          {activeCategoryTabs.map((cat) => {
            const active = shopFilters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setShopFilters((prev) => ({ ...prev, category: cat }))}
                className={`px-4 py-2 text-xs whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                    : 'bg-transparent text-[#2B211B]/80 border-[#E8DFD1] hover:border-[#141210]'
                }`}
              >
                {cat === 'All' ? 'All Fragrances' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="hidden lg:block lg:col-span-3">
          <FilterPanel />
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-6 flex items-center justify-between text-xs text-[#2B211B]/70 tabular-nums">
            <span>
              Showing {filteredProducts.length} fragrance
              {filteredProducts.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="border border-[#E8DFD1] bg-[#F3EDE2]/40 p-12 text-center">
              <h2 className="font-serif text-2xl mb-2">No matching fragrances</h2>
              <p className="text-sm text-[#2B211B]/70 mb-6">
                Adjust or reset your filters to explore the full Fragrance Chamber catalog.
              </p>
              <button
                type="button"
                onClick={() => setShopFilters(DEFAULT_FILTERS)}
                className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#141210]/50"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xs bg-[#FAF7F2] h-full p-6 overflow-y-auto border-l border-[#E8DFD1]">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="p-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};
