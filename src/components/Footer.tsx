import React from 'react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigate, openShopWithFilter, isAdmin } = useStore();

  return (
    <footer className="bg-[#141210] text-[#FAF7F2] border-t border-[#2B211B]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h2 className="font-serif text-xl tracking-[0.14em] text-[#FAF7F2] mb-4">
              FRAGRANCE CHAMBER CONCEPT
            </h2>
            <p className="text-sm text-[#FAF7F2]/70 leading-relaxed max-w-xs">
              Discover Your Signature Scent. A modern fragrance house devoted to
              quiet elegance, rare botanicals, and unforgettable impressions.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] text-[#C5A264] mb-4">
              Boutique
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/75">
              <li>
                <button
                  type="button"
                  onClick={() => openShopWithFilter({})}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  All Fragrances
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openShopWithFilter({ newArrivalsOnly: true })}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openShopWithFilter({ category: 'Perfume Oils' })}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Perfume Oils
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openShopWithFilter({ category: 'Gift Sets' })}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Gift Coffrets
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] text-[#C5A264] mb-4">
              Client Services
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/75">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/track')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Track an Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Concierge & Inquiries
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Shopping Bag
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  My Account
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] text-[#C5A264] mb-4">
              The House
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/75">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  Ingredient Philosophy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate(isAdmin ? '/admin' : '/account')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  {isAdmin ? 'Admin Dashboard' : 'Store Administration'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#2B211B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF7F2]/55">
          <p>© {new Date().getFullYear()} Fragrance Chamber Concept. All rights reserved.</p>
          <p>Where fragrance becomes an experience.</p>
        </div>
      </div>
    </footer>
  );
};
