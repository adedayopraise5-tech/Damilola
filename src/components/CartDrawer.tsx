import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    settings,
    navigate,
  } = useStore();

  if (!cartDrawerOpen) return null;

  const threshold = settings.freeShippingThreshold || 150;
  const remaining = Math.max(0, threshold - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#141210]/50 backdrop-blur-[2px]"
        onClick={() => setCartDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        aria-label="Shopping Bag"
        className="relative z-10 w-full max-w-md bg-[#FAF7F2] text-[#141210] h-full flex flex-col border-l border-[#E8DFD1] shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-[#E8DFD1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#B69354]" />
            <h2 className="font-serif text-xl font-medium">
              Your Bag ({cartCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close bag"
            className="w-9 h-9 flex items-center justify-center text-[#141210] hover:text-[#B69354] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-6 py-3 bg-[#F3EDE2] border-b border-[#E8DFD1] text-xs text-[#2B211B]">
          {remaining === 0 ? (
            <p>You have unlocked complimentary insured shipping.</p>
          ) : (
            <p>
              Add <span className="font-medium tabular-nums">${remaining.toFixed(2)}</span> more for complimentary shipping.
            </p>
          )}
          <div className="mt-2 h-1 bg-[#E8DFD1] w-full overflow-hidden">
            <div
              className="h-full bg-[#B69354] transition-all duration-300"
              style={{ width: `${Math.min(100, (cartSubtotal / threshold) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-[#E8DFD1]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="font-serif text-2xl mb-2">Your bag is empty</p>
              <p className="text-sm text-[#2B211B]/70 mb-6 max-w-xs">
                Explore our signature extraits, perfume oils, and discovery coffrets.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/shop');
                }}
                className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] cursor-pointer"
              >
                Explore Fragrances
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.productId}-${item.sizeLabel}`}
                className="py-4 flex gap-4"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate(`/product/${item.slug}`);
                  }}
                  className="w-20 h-20 bg-[#F3EDE2] border border-[#E8DFD1] shrink-0 overflow-hidden cursor-pointer"
                >
                  <SafeImage src={item.image} alt={item.name} fallbackTitle={item.name} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#2B211B]/60">
                        {item.brand}
                      </p>
                      <h3 className="font-serif text-lg leading-snug truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#2B211B]/70">{item.sizeLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.sizeLabel)}
                      aria-label={`Remove ${item.name}`}
                      className="text-[#2B211B]/50 hover:text-[#141210] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#E8DFD1] bg-[#F3EDE2]/40">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.sizeLabel, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#E8DFD1]/60 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.sizeLabel, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#E8DFD1]/60 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium tabular-nums">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[#E8DFD1] bg-[#F3EDE2]/50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#2B211B]/80">Subtotal</span>
              <span className="font-medium text-base tabular-nums">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/cart');
                }}
                className="py-3 px-4 border border-[#141210] text-[#141210] text-xs uppercase tracking-[0.16em] hover:bg-[#141210]/5 cursor-pointer whitespace-nowrap"
              >
                View Bag
              </button>
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="py-3 px-4 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.16em] hover:bg-[#2B211B] cursor-pointer whitespace-nowrap"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
