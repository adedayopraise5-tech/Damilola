import React from 'react';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    products,
    wishlistDrawerOpen,
    setWishlistDrawerOpen,
    toggleWishlist,
    addToCart,
    navigate,
  } = useStore();

  if (!wishlistDrawerOpen) return null;

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#141210]/50 backdrop-blur-[2px]"
        onClick={() => setWishlistDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        aria-label="Saved Fragrances"
        className="relative z-10 w-full max-w-md bg-[#FAF7F2] text-[#141210] h-full flex flex-col border-l border-[#E8DFD1] shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-[#E8DFD1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-[#B69354]" />
            <h2 className="font-serif text-xl font-medium">
              Saved Wishlist ({savedProducts.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setWishlistDrawerOpen(false)}
            aria-label="Close wishlist"
            className="w-9 h-9 flex items-center justify-center text-[#141210] hover:text-[#B69354] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-[#E8DFD1]">
          {savedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="font-serif text-2xl mb-2">No saved scents yet</p>
              <p className="text-sm text-[#2B211B]/70 mb-6 max-w-xs">
                Save your favorite perfumes and oils here to revisit or gift later.
              </p>
              <button
                type="button"
                onClick={() => {
                  setWishlistDrawerOpen(false);
                  navigate('/shop');
                }}
                className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] cursor-pointer"
              >
                Browse Boutique
              </button>
            </div>
          ) : (
            savedProducts.map((product) => (
              <div key={product.id} className="py-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setWishlistDrawerOpen(false);
                    navigate(`/product/${product.slug}`);
                  }}
                  className="w-20 h-20 bg-[#F3EDE2] border border-[#E8DFD1] shrink-0 overflow-hidden cursor-pointer"
                >
                  <SafeImage src={product.images[0]} alt={product.name} fallbackTitle={product.name} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#2B211B]/60">
                        {product.brand}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setWishlistDrawerOpen(false);
                          navigate(`/product/${product.slug}`);
                        }}
                        className="font-serif text-lg hover:text-[#B69354] text-left cursor-pointer"
                      >
                        {product.name}
                      </button>
                      <p className="text-sm font-medium tabular-nums mt-0.5">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="text-[#2B211B]/50 hover:text-[#141210] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={() => {
                      setWishlistDrawerOpen(false);
                      addToCart(product, product.sizes[0]?.label, 1);
                    }}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#141210] text-[#FAF7F2] text-[11px] uppercase tracking-[0.14em] hover:bg-[#2B211B] disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Move to Bag'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
