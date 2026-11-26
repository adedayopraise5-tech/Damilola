import React, { useEffect, useState } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cancelOwnOrder, subscribeUserOrders } from '../lib/firestoreService';
import type { Order } from '../types/store';

export const AccountPage: React.FC = () => {
  const {
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    signOut,
    navigate,
    wishlist,
    products,
    showToast,
  } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const unsub = subscribeUserOrders(user.uid, setOrders);
    return () => unsub();
  }, [user]);

  const savedItems = products.filter((p) => wishlist.includes(p.id));

  if (!authReady) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center text-sm text-[#2B211B]/70">
        Loading your boutique profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
          Client Account
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#141210] mb-4">
          Welcome to Fragrance Chamber
        </h1>
        <p className="text-sm text-[#2B211B]/75 mb-8 leading-relaxed">
          Sign in with your Google account to sync your fragrance wishlist, view your
          order history, and manage deliveries.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="px-8 py-4 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const handleCancel = async (order: Order) => {
    try {
      await cancelOwnOrder(order);
      showToast(`Order ${order.orderCode} has been cancelled.`);
    } catch {
      showToast('Unable to cancel this order right now.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20 space-y-14">
      <div className="border-b border-[#E8DFD1] pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-1">
            Client Profile
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#141210]">
            {user.displayName || 'Valued Patron'}
          </h1>
          <p className="text-sm text-[#2B211B]/70 mt-1">{user.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141210] text-[#C5A264] text-xs uppercase tracking-[0.16em] cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Open Admin Dashboard</span>
            </button>
          )}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E8DFD1] text-xs uppercase tracking-[0.16em] hover:border-[#141210] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Order History */}
      <section>
        <h2 className="font-serif text-2xl font-medium text-[#141210] mb-5">
          Order History
        </h2>
        {orders.length === 0 ? (
          <div className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-8 text-sm text-[#2B211B]/75">
            You have not placed any orders yet.{' '}
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="text-[#141210] underline cursor-pointer"
            >
              Explore our fragrances
            </button>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-[#E8DFD1] bg-[#F3EDE2]/35 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-serif text-xl text-[#141210] tabular-nums">
                    {order.orderCode}
                  </p>
                  <p className="text-xs text-[#2B211B]/75 mt-1">
                    {order.items.map((i) => `${i.name} (${i.sizeLabel} × ${i.quantity})`).join(' · ')}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#B69354] mt-2">
                    Status: {order.status} · Payment: {order.paymentStatus.replace('_', ' ')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-medium tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order)}
                      className="px-4 py-2 border border-[#E8DFD1] text-xs hover:border-red-700 hover:text-red-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Wishlist */}
      <section>
        <h2 className="font-serif text-2xl font-medium text-[#141210] mb-5">
          Saved Wishlist ({savedItems.length})
        </h2>
        {savedItems.length === 0 ? (
          <p className="text-sm text-[#2B211B]/70">No saved items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {savedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/product/${item.slug}`)}
                className="p-4 border border-[#E8DFD1] bg-[#F3EDE2]/35 text-left hover:border-[#B69354] cursor-pointer"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#2B211B]/60">
                  {item.brand}
                </p>
                <p className="font-serif text-xl text-[#141210] mt-0.5">{item.name}</p>
                <p className="text-sm font-medium tabular-nums mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
