import React, { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    route,
    navigate,
    settings,
    cartCount,
    wishlist,
    user,
    isAdmin,
    setCartDrawerOpen,
    setWishlistDrawerOpen,
    setSearchOpen,
    openShopWithFilter,
  } = useStore();

  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showAnnouncement = settings.announcementEnabled && !announcementDismissed;

  const navLinkClass = (active: boolean) =>
    `text-[13px] tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b ${
      active
        ? 'text-[#141210] border-[#B69354] font-medium'
        : 'text-[#2B211B]/80 border-transparent hover:text-[#141210] hover:border-[#E8DFD1]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD1]">
      {showAnnouncement && (
        <div className="bg-[#141210] text-[#FAF7F2] px-4 py-1.5 min-h-[32px] flex items-center justify-center relative text-center">
          <p className="text-[11px] sm:text-xs tracking-[0.12em] text-[#FAF7F2]/90 truncate max-w-[85vw]">
            {settings.announcementText}
          </p>
          <button
            type="button"
            onClick={() => setAnnouncementDismissed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FAF7F2]/60 hover:text-[#FAF7F2] p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-serif text-base sm:text-lg lg:text-xl font-semibold tracking-[0.12em] text-[#141210] whitespace-nowrap shrink-0 cursor-pointer text-left"
        >
          FRAGRANCE CHAMBER CONCEPT
        </button>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={navLinkClass(route === '/')}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => openShopWithFilter({})}
            className={navLinkClass(route === '/shop')}
          >
            Shop
          </button>
          <button
            type="button"
            onClick={() => openShopWithFilter({ category: 'Niche Fragrances' })}
            className={navLinkClass(false)}
          >
            Collections
          </button>
          <button
            type="button"
            onClick={() => navigate('/about')}
            className={navLinkClass(route === '/about')}
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className={navLinkClass(route === '/contact')}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Primary Action Cluster */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search fragrances"
            className="w-10 h-10 flex items-center justify-center text-[#141210] hover:text-[#B69354] transition-colors cursor-pointer"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setWishlistDrawerOpen(true)}
            aria-label="Open wishlist"
            className="relative w-10 h-10 flex items-center justify-center text-[#141210] hover:text-[#B69354] transition-colors cursor-pointer"
          >
            <Heart className="w-[18px] h-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 text-[10px] font-medium tabular-nums bg-[#141210] text-[#FAF7F2] min-w-[16px] h-4 px-1 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/admin' : '/account')}
            aria-label={isAdmin ? 'Admin dashboard' : 'Customer account'}
            className="w-10 h-10 hidden sm:flex items-center justify-center text-[#141210] hover:text-[#B69354] transition-colors cursor-pointer"
            title={user ? (isAdmin ? 'Admin Dashboard' : user.displayName || 'Account') : 'Sign In'}
          >
            <User className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label="Open shopping bag"
            className="relative h-10 px-2.5 flex items-center gap-1.5 text-[#141210] hover:text-[#B69354] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            <span className="text-xs font-medium tabular-nums">{cartCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-[#141210] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8DFD1] bg-[#FAF7F2] px-6 py-5 space-y-3">
          <div className="flex flex-col space-y-2.5">
            {[
              { label: 'Home', action: () => navigate('/') },
              { label: 'Shop All Fragrances', action: () => openShopWithFilter({}) },
              { label: 'Niche Collections', action: () => openShopWithFilter({ category: 'Niche Fragrances' }) },
              { label: 'Gift Sets', action: () => openShopWithFilter({ category: 'Gift Sets' }) },
              { label: 'About Us', action: () => navigate('/about') },
              { label: 'Track Order', action: () => navigate('/track') },
              { label: 'Contact & Inquiries', action: () => navigate('/contact') },
              { label: 'Account & Saved Orders', action: () => navigate('/account') },
              ...(isAdmin ? [{ label: 'Admin Dashboard', action: () => navigate('/admin') }] : []),
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm tracking-[0.06em] text-[#141210] border-b border-[#E8DFD1]/60 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
