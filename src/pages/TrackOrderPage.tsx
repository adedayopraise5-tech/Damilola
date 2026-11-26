import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { trackOrderByCode } from '../lib/firestoreService';
import type { OrderStatus, OrderTracker } from '../types/store';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing Shipment' },
  { key: 'shipped', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
];

export const TrackOrderPage: React.FC = () => {
  const { navigate } = useStore();
  const [orderCodeInput, setOrderCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderTracker | null>(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCodeInput.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const tracker = await trackOrderByCode(orderCodeInput);
      setResult(tracker);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = result
    ? STEPS.findIndex((s) => s.key === result.status)
    : -1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-2">
          Order Verification
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141210]">
          Track Your Fragrance Order
        </h1>
        <p className="mt-3 text-sm text-[#2B211B]/75">
          Enter your Fragrance Chamber Concept order reference (for example, FCC-2026-4812)
          to inspect live preparation and dispatch status.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#2B211B]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={orderCodeInput}
            onChange={(e) => setOrderCodeInput(e.target.value.toUpperCase())}
            placeholder="Order Code (e.g. FCC-2026-1042)"
            className="w-full pl-10 pr-4 py-3.5 bg-[#F3EDE2]/60 border border-[#E8DFD1] text-sm uppercase tracking-wider focus:outline-none focus:border-[#B69354]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-7 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {searched && !loading && !result && (
        <div className="mt-10 border border-[#E8DFD1] bg-[#F3EDE2]/45 p-8 text-center">
          <p className="font-serif text-2xl text-[#141210] mb-2">
            Order reference not found
          </p>
          <p className="text-sm text-[#2B211B]/75 mb-6">
            Verify the order code from your confirmation receipt, or contact our concierge
            for assistance.
          </p>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="px-6 py-3 border border-[#141210] text-xs uppercase tracking-[0.16em] cursor-pointer"
          >
            Inquire With Concierge
          </button>
        </div>
      )}

      {result && (
        <div className="mt-10 border border-[#E8DFD1] bg-[#F3EDE2]/45 p-7 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8DFD1] pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#B69354]">
                Order Reference
              </p>
              <h2 className="font-serif text-3xl text-[#141210] mt-1 tabular-nums">
                {result.orderCode}
              </h2>
            </div>
            <div className="text-left sm:text-right text-sm tabular-nums">
              <p className="text-[#2B211B]/70">
                {result.itemCount} Item{result.itemCount === 1 ? '' : 's'} · ${result.total.toFixed(2)}
              </p>
              <p className="text-xs uppercase tracking-[0.14em] text-[#141210] mt-1">
                Payment: {result.paymentStatus.replace('_', ' ')}
              </p>
            </div>
          </div>

          {result.status === 'cancelled' ? (
            <div className="p-4 border border-red-300 bg-red-50 text-sm text-red-900">
              This order has been cancelled. Contact our concierge if you require further assistance.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STEPS.map((step, idx) => {
                const completed = idx <= currentIndex;
                return (
                  <div
                    key={step.key}
                    className={`p-4 border ${
                      completed
                        ? 'border-[#141210] bg-[#141210] text-[#FAF7F2]'
                        : 'border-[#E8DFD1] bg-[#FAF7F2] text-[#2B211B]/55'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.16em] mb-1">
                      0{idx + 1}
                    </p>
                    <p className="text-xs font-medium">{step.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {result.carrierNote && (
            <div className="flex items-start gap-3 pt-2 text-sm text-[#2B211B]/85">
              <Package className="w-4 h-4 text-[#B69354] shrink-0 mt-0.5" />
              <p>{result.carrierNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
