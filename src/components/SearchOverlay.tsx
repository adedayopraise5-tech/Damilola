import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

export const SearchOverlay: React.FC = () => {
  const { searchOpen, setSearchOpen, products, navigate, openShopWithFilter } = useStore();
  const [queryText, setQueryText] = useState('');

  const matches = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products.filter((p) => {
      const haystack = [
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
      return haystack.includes(q);
    });
  }, [products, queryText]);

  if (!searchOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    openShopWithFilter({ searchQuery: queryText.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="w-full max-w-2xl bg-[#FAF7F2] border border-[#E8DFD1] shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-center border-b border-[#E8DFD1] px-5">
          <Search className="w-5 h-5 text-[#B69354] shrink-0" />
          <input
            type="text"
            autoFocus
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search by perfume, brand, note (oud, neroli, rose), or family..."
            className="w-full py-4 px-3 bg-transparent text-sm text-[#141210] placeholder:text-[#2B211B]/45 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="p-2 text-[#2B211B]/70 hover:text-[#141210] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#2B211B]/60">
              {queryText.trim()
                ? `${matches.length} Matching Fragrance${matches.length === 1 ? '' : 's'}`
                : 'Suggested Creations'}
            </p>
            {queryText.trim() && matches.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  openShopWithFilter({ searchQuery: queryText.trim() });
                }}
                className="text-xs text-[#B69354] hover:underline cursor-pointer"
              >
                View all in Shop
              </button>
            )}
          </div>

          {matches.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#2B211B]/70">
              No fragrances matched "{queryText}". Try searching for "Oud", "Floral", or "Oil".
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate(`/product/${product.slug}`);
                  }}
                  className="flex items-center gap-3.5 p-2.5 border border-[#E8DFD1] hover:border-[#B69354] text-left transition-colors cursor-pointer bg-[#F3EDE2]/30"
                >
                  <div className="w-16 h-16 shrink-0 bg-[#F3EDE2] overflow-hidden">
                    <SafeImage src={product.images[0]} alt={product.name} fallbackTitle={product.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#2B211B]/60 truncate">
                      {product.brand} · {product.fragranceFamily}
                    </p>
                    <p className="font-serif text-base text-[#141210] truncate">
                      {product.name}
                    </p>
                    <p className="text-xs font-medium tabular-nums text-[#2B211B]">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
