'use client';

import { useAppStore } from '@/lib/store';
import { Header } from '@/components/wabuz/Header';
import { BottomNav } from '@/components/wabuz/BottomNav';
import { ClientHome } from '@/components/wabuz/ClientHome';
import { ProductDetail } from '@/components/wabuz/ProductDetail';
import { CheckoutFlow } from '@/components/wabuz/CheckoutFlow';
import ClientOrders from '@/components/client/ClientOrders';
import { ClientProfile } from '@/components/client/ClientProfile';
import { VendorDashboard } from '@/components/wabuz/VendorDashboard';
import { VendorProducts } from '@/components/wabuz/VendorProducts';
import { VendorOrders } from '@/components/wabuz/VendorOrders';
import { VendorAddProduct } from '@/components/wabuz/VendorAddProduct';
import { VendorStore } from '@/components/wabuz/VendorStore';
import { AntiScamModal } from '@/components/wabuz/AntiScamModal';
import { useEffect, useState } from 'react';

export default function Home() {
  const { view, mode, clientLoggedIn, loadClientFromStorage } = useAppStore();

  // Anti-scam modal state: show once when client logs in for the first time
  const [showAntiScam, setShowAntiScam] = useState(false);
  const [antiScamChecked, setAntiScamChecked] = useState(false);

  // Load client profile from localStorage on mount (auto-login)
  useEffect(() => {
    loadClientFromStorage();
  }, [loadClientFromStorage]);

  // Show anti-scam modal when client first becomes logged in
  // (either via localStorage auto-login or after checkout profile save)
  useEffect(() => {
    if (antiScamChecked) return; // Already checked once

    if (clientLoggedIn) {
      // Client is logged in — check if they've seen the warning
      if (typeof window !== 'undefined') {
        const seen = localStorage.getItem('wabuz_seen_warning');
        if (!seen) {
          setShowAntiScam(true);
        }
      }
      setAntiScamChecked(true);
    }
  }, [clientLoggedIn, antiScamChecked]);

  const renderView = () => {
    switch (view) {
      // Client views
      case 'home':
        return <ClientHome />;
      case 'search':
        return <ClientHome autoFocusSearch />;
      case 'product-detail':
        return <ProductDetailWrapper />;
      case 'checkout':
        return <CheckoutFlow />;
      case 'payment-processing':
        return <CheckoutFlow />;
      case 'payment-success':
        return <CheckoutFlow />;
      case 'orders':
        return <ClientOrders />;
      case 'profile':
        return <ClientProfile />;

      // Vendor views
      case 'vendor-dashboard':
        return <VendorDashboard />;
      case 'vendor-products':
        return <VendorProducts />;
      case 'vendor-orders':
        return <VendorOrders />;
      case 'vendor-add-product':
        return <VendorAddProduct />;
      case 'vendor-store-setup':
        return <VendorDashboard />;
      case 'vendor-store':
        return <VendorStore />;

      default:
        return <ClientHome />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full">
        <div className="page-enter pb-24">
          {renderView()}
        </div>
      </main>
      <BottomNav />

      {/* Anti-Scam Modal — shown once per device on first login */}
      <AntiScamModal
        forceShow={showAntiScam}
        onDismiss={() => setShowAntiScam(false)}
      />
    </div>
  );
}

function ProductDetailWrapper() {
  const { selectedProduct } = useAppStore();
  if (!selectedProduct) return null;
  return <ProductDetail product={selectedProduct} />;
}
