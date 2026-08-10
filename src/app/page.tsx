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
import { useEffect } from 'react';

export default function Home() {
  const { view, mode, loadClientFromStorage } = useAppStore();

  // Load client profile from localStorage on mount (auto-login)
  useEffect(() => {
    loadClientFromStorage();
  }, [loadClientFromStorage]);

  const renderView = () => {
    switch (view) {
      // Client views
      case 'home':
        return <ClientHome />;
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

      default:
        return <ClientHome />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full">
        <div className="page-enter">
          {renderView()}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function ProductDetailWrapper() {
  const { selectedProduct } = useAppStore();
  if (!selectedProduct) return null;
  return <ProductDetail product={selectedProduct} />;
}
