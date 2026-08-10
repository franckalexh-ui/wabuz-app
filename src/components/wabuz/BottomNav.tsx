'use client';

import { useAppStore } from '@/lib/store';
import { Home, Search, ShoppingBag, User, LayoutDashboard, Package, PlusCircle, Store } from 'lucide-react';
import type { AppView } from '@/lib/store';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  view: AppView;
  badge?: number;
  elevated?: boolean; // Instagram-style elevated center button
}

export function BottomNav() {
  const { mode, view, setView, newOrderCount, vendorPendingCount } = useAppStore();

  // ── Client Nav: Accueil, Recherche, Commandes, Profil ──────────
  const clientNavItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Accueil', view: 'home' },
    { icon: <Search className="w-5 h-5" />, label: 'Recherche', view: 'search' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Commandes', view: 'orders' },
    { icon: <User className="w-5 h-5" />, label: 'Profil', view: 'profile' },
  ];

  // ── Vendor Nav: Tableau, Commandes, ➕Ajouter (elevated), Ma Boutique ──
  const vendorNavItems: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau', view: 'vendor-dashboard', badge: newOrderCount > 0 ? newOrderCount : undefined },
    { icon: <Package className="w-5 h-5" />, label: 'Commandes', view: 'vendor-orders', badge: vendorPendingCount > 0 ? vendorPendingCount : undefined },
    { icon: <PlusCircle className="w-6 h-6" />, label: 'Ajouter', view: 'vendor-add-product', elevated: true },
    { icon: <Store className="w-5 h-5" />, label: 'Ma Boutique', view: 'vendor-store' },
  ];

  const navItems = mode === 'client' ? clientNavItems : vendorNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = view === item.view || 
            (item.view === 'home' && (view === 'home' || view === 'product-detail' || view === 'checkout' || view === 'payment-processing' || view === 'payment-success')) ||
            (item.view === 'search' && view === 'search') ||
            (item.view === 'orders' && view === 'orders') ||
            (item.view === 'profile' && view === 'profile') ||
            (item.view === 'vendor-dashboard' && (view === 'vendor-dashboard' || view === 'vendor-store-setup')) ||
            (item.view === 'vendor-orders' && view === 'vendor-orders') ||
            (item.view === 'vendor-add-product' && view === 'vendor-add-product') ||
            (item.view === 'vendor-store' && view === 'vendor-store') ||
            (item.view === 'vendor-products' && view === 'vendor-products');
          
          // Instagram-style elevated center button
          if (item.elevated) {
            return (
              <button
                key={item.label}
                onClick={() => setView(item.view)}
                className={`relative flex flex-col items-center justify-end -mt-5 transition-all ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive
                    ? 'bg-orange-500 shadow-orange-500/40'
                    : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-semibold mt-0.5 ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}>{item.label}</span>
              </button>
            );
          }

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
