import React from 'react';
import { Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderConfirmationPage: React.FC = () => {
  const { lastConfirmedOrder, navigate } = useStore();

  if (!lastConfirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-3xl mb-3">Order Receipt</h1>
        <p className="text-sm text-[#2B211B]/75 mb-6">
          Look up an existing order by reference or return to our boutique.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/track')}
            className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            Track an Order
          </button>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-6 py-3 border border-[#141210] text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            Shop Fragrances
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <div className="border border-[#E8DFD1] bg-[#F3EDE2]/45 p-8 sm:p-12">
        <div className="flex items-center gap-3 text-[#B69354] mb-4">
          <span className="w-8 h-8 border border-[#B69354] flex items-center justify-center">
            <Check className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase tracking-[0.2em]">
            Order Confirmed — Preparing Shipment
          </span>
        </div>

        <h1 className="font-serif text-4xl font-medium text-[#141210] tabular-nums">
          Order #{lastConfirmedOrder.orderCode} Confirmed
        </h1>
        <p className="mt-3 text-sm text-[#2B211B]/80 leading-relaxed">
          Thank you, {lastConfirmedOrder.customerName}. Your fragrances are now being
          prepared at Fragrance Chamber Concept. Keep your order reference to track
          dispatch progress at any time.
        </p>

        <div className="mt-8 border-t border-b border-[#E8DFD1] py-6 space-y-3 text-sm">
          {lastConfirmedOrder.items.map((item, idx) => (
            <div key={idx} className="flex justify-between gap-4">
              <span>
                {item.name} ({item.sizeLabel}) × {item.quantity}
              </span>
              <span className="tabular-nums font-medium">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-[#E8DFD1] font-medium text-base tabular-nums">
            <span>Total Paid / Due</span>
            <span>${lastConfirmedOrder.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#2B211B]/80">
          <div>
            <p className="uppercase tracking-[0.16em] text-[#2B211B]/55 mb-1">
              Delivery Destination
            </p>
            <p>{lastConfirmedOrder.shippingAddress}</p>
            <p>
              {lastConfirmedOrder.city}, {lastConfirmedOrder.postalCode},{' '}
              {lastConfirmedOrder.country}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-[0.16em] text-[#2B211B]/55 mb-1">
              Payment & Presentation
            </p>
            <p className="capitalize">
              Method: {lastConfirmedOrder.paymentMethod.replace('_', ' ')}
            </p>
            <p>
              Gift Wrap: {lastConfirmedOrder.giftWrap ? 'Signature Ivory Box' : 'Standard'}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/track')}
            className="px-6 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            Track Order Status
          </button>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-6 py-3.5 border border-[#141210] text-xs uppercase tracking-[0.18em] cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
