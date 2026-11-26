/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { QuickViewModal } from './components/QuickViewModal';
import { StoreProvider, useStore } from './context/StoreContext';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

const AppShell: React.FC = () => {
  const { route, toastMessage } = useStore();

  const renderPage = () => {
    if (route.startsWith('/product/')) {
      const slug = route.replace('/product/', '');
      return <ProductDetailsPage slug={slug} />;
    }
    switch (route) {
      case '/shop':
        return <ShopPage />;
      case '/about':
        return <AboutPage />;
      case '/contact':
        return <ContactPage />;
      case '/track':
        return <TrackOrderPage />;
      case '/cart':
        return <CartPage />;
      case '/checkout':
        return <CheckoutPage />;
      case '/order-confirmation':
        return <OrderConfirmationPage />;
      case '/account':
        return <AccountPage />;
      case '/admin':
        return <AdminPage />;
      case '/':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#141210]">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <SearchOverlay />
      <QuickViewModal />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#141210] text-[#FAF7F2] border border-[#C5A264]/45 px-5 py-3 text-xs tracking-[0.08em] shadow-xl"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </ErrorBoundary>
  );
}
