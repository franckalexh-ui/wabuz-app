'use client';

import { useAppStore } from '@/lib/store';
import { Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import type { AppView } from '@/lib/store';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  view: AppView;
  badge?: number;
}

export function BottomNav() {
  const { mode, view, setView, newOrderCount, vendorPendingCount } = useAppStore();

  const clientNavItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Accueil', view: 'home' },
    { icon: <Grid3X3 className="w-5 h-5" />, label: 'Catégories', view: 'home' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Commandes', view: 'orders' },
    { icon: <User className="w-5 h-5" />, label: 'Profil', view: 'home' },
  ];

  const vendorNavItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Tableau', view: 'vendor-dashboard', badge: newOrderCount > 0 ? newOrderCount : undefined },
    { icon: <Grid3X3 className="w-5 h-5" />, label: 'Produits', view: 'vendor-products' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Commandes', view: 'vendor-orders', badge: vendorPendingCount > 0 ? vendorPendingCount : undefined },
    { icon: <User className="w-5 h-5" />, label: 'Profil', view: 'vendor-dashboard' },
  ];

  const navItems = mode === 'client' ? clientNavItems : vendorNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = view === item.view || 
            (item.view === 'home' && (view === 'home' || view === 'product-detail' || view === 'checkout' || view === 'payment-processing' || view === 'payment-success')) ||
            (item.view === 'orders' && view === 'orders') ||
            (item.view === 'vendor-dashboard' && (view === 'vendor-dashboard' || view === 'vendor-add-product')) ||
            (item.view === 'vendor-products' && view === 'vendor-products') ||
            (item.view === 'vendor-orders' && view === 'vendor-orders');
          
          return (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
