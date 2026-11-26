import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    navigate,
  } = useStore();

  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0]?.label || '');
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const activeSize =
    quickViewProduct.sizes.find((s) => s.label === selectedSize) ??
    quickViewProduct.sizes[0];
  const wishlisted = isWishlisted(quickViewProduct.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#FAF7F2] border border-[#E8DFD1] shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-[#FAF7F2]/90 border border-[#E8DFD1] flex items-center justify-center text-[#141210] hover:text-[#B69354] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="aspect-[4/3] md:aspect-auto md:h-full bg-[#F3EDE2]">
          <SafeImage
            src={quickViewProduct.images[0]}
            alt={quickViewProduct.name}
            fallbackTitle={quickViewProduct.name}
          />
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#B69354]">
              {quickViewProduct.brand} · {quickViewProduct.fragranceFamily}
            </p>
            <h2 className="font-serif text-3xl font-medium mt-1.5 text-[#141210]">
              {quickViewProduct.name}
            </h2>
            {quickViewProduct.concentration && (
              <p className="text-xs text-[#2B211B]/65 mt-1">
                {quickViewProduct.concentration}
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-2.5 tabular-nums">
              <span className="text-xl font-medium text-[#141210]">
                ${(activeSize?.price ?? quickViewProduct.price).toFixed(2)}
              </span>
              {activeSize?.previousPrice && activeSize.previousPrice > activeSize.price && (
                <span className="text-sm text-[#2B211B]/50 line-through">
                  ${activeSize.previousPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-[#2B211B]/80 leading-relaxed">
              {quickViewProduct.description}
            </p>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-2">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.sizes.map((size) => {
                  const active = size.label === activeSize?.label;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => setSelectedSize(size.label)}
                      className={`px-3.5 py-2 text-xs border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                          : 'bg-transparent text-[#141210] border-[#E8DFD1] hover:border-[#141210]'
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E8DFD1] space-y-3">
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={quickViewProduct.stock === 0}
                onClick={() => {
                  addToCart(quickViewProduct, activeSize?.label, 1);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 px-5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-[#2B211B] disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{quickViewProduct.stock === 0 ? 'Sold Out' : 'Add to Bag'}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(quickViewProduct.id)}
                aria-label="Toggle wishlist"
                className={`w-11 border flex items-center justify-center cursor-pointer ${
                  wishlisted
                    ? 'bg-[#141210] text-[#C5A264] border-[#141210]'
                    : 'border-[#E8DFD1] text-[#141210] hover:border-[#141210]'
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const slug = quickViewProduct.slug;
                setQuickViewProduct(null);
                navigate(`/product/${slug}`);
              }}
              className="w-full text-center text-xs uppercase tracking-[0.16em] text-[#2B211B]/75 hover:text-[#141210] py-1 cursor-pointer"
            >
              View Full Olfactory Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
