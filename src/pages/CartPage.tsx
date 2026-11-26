import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from '../components/SafeImage';

export const CartPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    giftWrap,
    setGiftWrap,
    updateCartQuantity,
    removeFromCart,
    settings,
    navigate,
  } = useStore();

  const threshold = settings.freeShippingThreshold || 150;
  const shippingFee = cartSubtotal === 0 || cartSubtotal >= threshold ? 0 : 15;
  const total = cartSubtotal + shippingFee;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
      <div className="border-b border-[#E8DFD1] pb-6 mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
          Shopping Bag
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#141210]">
          Your Selected Fragrances
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-12 text-center">
          <h2 className="font-serif text-2xl mb-3">Your shopping bag is currently empty</h2>
          <p className="text-sm text-[#2B211B]/70 mb-7">
            Discover our curated perfumes, concentrated oils, and gift sets.
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-7 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            Browse Boutique
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 divide-y divide-[#E8DFD1] border-t border-b border-[#E8DFD1]">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.sizeLabel}`}
                className="py-6 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/product/${item.slug}`)}
                  className="w-24 h-24 bg-[#F3EDE2] border border-[#E8DFD1] shrink-0 overflow-hidden cursor-pointer"
                >
                  <SafeImage src={item.image} alt={item.name} fallbackTitle={item.name} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#2B211B]/60">
                    {item.brand}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${item.slug}`)}
                    className="font-serif text-xl text-[#141210] hover:text-[#B69354] cursor-pointer text-left"
                  >
                    {item.name}
                  </button>
                  <p className="text-xs text-[#2B211B]/70 mt-0.5">
                    Volume: {item.sizeLabel} · ${item.unitPrice.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="inline-flex items-center border border-[#E8DFD1] bg-[#F3EDE2]/40">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(item.productId, item.sizeLabel, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="w-9 h-9 flex items-center justify-center hover:bg-[#E8DFD1]/60 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(item.productId, item.sizeLabel, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                      className="w-9 h-9 flex items-center justify-center hover:bg-[#E8DFD1]/60 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-base font-medium tabular-nums w-20 text-right">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.sizeLabel)}
                    aria-label={`Remove ${item.name}`}
                    className="text-[#2B211B]/50 hover:text-[#141210] p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4 bg-[#F3EDE2]/55 border border-[#E8DFD1] p-7 h-fit space-y-5">
            <h2 className="font-serif text-2xl font-medium text-[#141210]">
              Order Summary
            </h2>

            <label className="flex items-start gap-3 text-sm text-[#2B211B] py-3 border-y border-[#E8DFD1] cursor-pointer">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="mt-0.5 accent-[#141210] w-4 h-4"
              />
              <span>
                <span className="font-medium block">Complimentary Signature Gift Wrap</span>
                <span className="text-xs text-[#2B211B]/70">
                  Ivory presentation box with champagne ribbon
                </span>
              </span>
            </label>

            <div className="space-y-2.5 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#2B211B]/75">Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2B211B]/75">Insured Shipping</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E8DFD1] text-base font-medium">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
