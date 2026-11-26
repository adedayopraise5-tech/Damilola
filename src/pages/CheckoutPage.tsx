import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { placeOrder } from '../lib/firestoreService';
import type { Order, PaymentMethod, PaymentStatus } from '../types/store';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    giftWrap,
    setGiftWrap,
    settings,
    user,
    signInWithGoogle,
    clearCart,
    setLastConfirmedOrder,
    navigate,
    showToast,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [giftNote, setGiftNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardLast4, setCardLast4] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.displayName || '');
      setCustomerEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  const threshold = settings.freeShippingThreshold || 150;
  const shippingFee = cartSubtotal === 0 || cartSubtotal >= threshold ? 0 : 15;
  const total = cartSubtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Your bag is empty</h1>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let activeUser = user;
    if (!activeUser) {
      activeUser = await signInWithGoogle();
      if (!activeUser) {
        setErrorMsg('Please sign in with Google to verify your order and save your receipt.');
        return;
      }
    }

    if (paymentMethod === 'card' && cardLast4.replace(/\s+/g, '').length < 12) {
      setErrorMsg('Please enter a valid payment card number for checkout.');
      return;
    }

    const paymentStatus: PaymentStatus =
      paymentMethod === 'card'
        ? 'paid'
        : paymentMethod === 'cod'
          ? 'pending_cod'
          : 'awaiting_transfer';

    setSubmitting(true);
    try {
      const items = cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        brand: c.brand,
        sizeLabel: c.sizeLabel,
        unitPrice: c.unitPrice,
        quantity: c.quantity,
        image: c.image,
      }));

      const { orderId, orderCode } = await placeOrder({
        userId: activeUser.uid,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        country,
        giftWrap,
        giftNote,
        paymentMethod,
        paymentStatus,
        items,
        subtotal: cartSubtotal,
        shippingFee,
        total,
      });

      const confirmedOrder: Order = {
        id: orderId,
        orderCode,
        userId: activeUser.uid,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        country,
        giftWrap,
        giftNote,
        paymentMethod,
        paymentStatus,
        status: 'confirmed',
        items,
        subtotal: cartSubtotal,
        shippingFee,
        total,
      };

      setLastConfirmedOrder(confirmedOrder);
      clearCart();
      showToast(`Order ${orderCode} confirmed.`);
      navigate('/order-confirmation');
    } catch {
      setErrorMsg('We could not process your order. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
      <div className="border-b border-[#E8DFD1] pb-6 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
            Boutique Checkout
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#141210]">
            Complete Your Order
          </h1>
        </div>
        {!user && (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-5 py-2.5 border border-[#141210] text-xs uppercase tracking-[0.16em] hover:bg-[#141210] hover:text-[#FAF7F2] transition-colors cursor-pointer"
          >
            Sign in with Google First
          </button>
        )}
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Information */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-medium text-[#141210]">
              01. Delivery Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
            </div>
          </section>

          {/* Gifting */}
          <section className="space-y-3 border-t border-[#E8DFD1] pt-6">
            <h2 className="font-serif text-2xl font-medium text-[#141210]">
              02. Presentation & Gift Note
            </h2>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="accent-[#141210] w-4 h-4"
              />
              <span>Include complimentary ivory gift box & champagne ribbon</span>
            </label>
            <textarea
              rows={2}
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="Optional handwritten card message..."
              className="w-full p-3 bg-[#F3EDE2]/50 border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
            />
          </section>

          {/* Payment Architecture */}
          <section className="space-y-4 border-t border-[#E8DFD1] pt-6">
            <h2 className="font-serif text-2xl font-medium text-[#141210]">
              03. Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'card', label: 'Card Checkout' },
                { id: 'bank_transfer', label: 'Bank Transfer' },
                { id: 'cod', label: 'Cash on Delivery' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-3 px-4 text-xs uppercase tracking-[0.14em] border text-center cursor-pointer transition-colors ${
                    paymentMethod === m.id
                      ? 'bg-[#141210] text-[#FAF7F2] border-[#141210]'
                      : 'border-[#E8DFD1] text-[#141210] hover:border-[#141210]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="p-5 bg-[#F3EDE2]/55 border border-[#E8DFD1] space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#2B211B]/75">
                  <Lock className="w-3.5 h-3.5 text-[#B69354]" />
                  <span>Encrypted boutique card checkout</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums focus:outline-none focus:border-[#B69354]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums focus:outline-none focus:border-[#B69354]"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm tabular-nums focus:outline-none focus:border-[#B69354]"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="p-5 bg-[#F3EDE2]/55 border border-[#E8DFD1] text-sm text-[#2B211B]/85 space-y-1">
                <p className="font-medium text-[#141210]">Direct Boutique Wire / Transfer</p>
                <p>
                  Your order reference will be generated immediately. Transfer instructions
                  appear on your confirmation receipt; dispatch begins upon settlement.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-5 bg-[#F3EDE2]/55 border border-[#E8DFD1] text-sm text-[#2B211B]/85 space-y-1">
                <p className="font-medium text-[#141210]">Cash on Delivery Terms</p>
                <p>
                  Pay <span className="font-medium tabular-nums">${total.toFixed(2)}</span> directly
                  upon courier arrival. Complimentary insured shipping applies over ${threshold}.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Summary Column */}
        <aside className="lg:col-span-5 bg-[#F3EDE2]/55 border border-[#E8DFD1] p-7 h-fit space-y-5">
          <h2 className="font-serif text-2xl font-medium text-[#141210]">
            Order Review
          </h2>

          <div className="divide-y divide-[#E8DFD1] max-h-72 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.sizeLabel}`}
                className="py-3 flex justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium text-[#141210]">{item.name}</p>
                  <p className="text-xs text-[#2B211B]/70">
                    {item.sizeLabel} × {item.quantity}
                  </p>
                </div>
                <p className="tabular-nums font-medium">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-[#E8DFD1] pt-4 tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#2B211B]/75">Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#2B211B]/75">Shipping</span>
              <span>{shippingFee === 0 ? 'Complimentary' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-medium pt-3 border-t border-[#E8DFD1]">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-700">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] hover:bg-[#2B211B] disabled:opacity-50 cursor-pointer"
          >
            {submitting
              ? 'Confirming Order...'
              : user
                ? `Place Order · $${total.toFixed(2)}`
                : 'Sign In & Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
};
