'use client';

import { useAppStore } from '@/lib/store';
import { Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import type { AppView } from '@/lib/store';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  view: AppView;
}

export function BottomNav() {
  const { mode, view, setView } = useAppStore();

  const clientNavItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Accueil', view: 'home' },
    { icon: <Grid3X3 className="w-5 h-5" />, label: 'Catégories', view: 'home' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Commandes', view: 'home' },
    { icon: <User className="w-5 h-5" />, label: 'Profil', view: 'home' },
  ];

  const vendorNavItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Tableau', view: 'vendor-dashboard' },
    { icon: <Grid3X3 className="w-5 h-5" />, label: 'Produits', view: 'vendor-products' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Commandes', view: 'vendor-orders' },
    { icon: <User className="w-5 h-5" />, label: 'Profil', view: 'vendor-dashboard' },
  ];

  const navItems = mode === 'client' ? clientNavItems : vendorNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = view === item.view || 
            (item.view === 'home' && (view === 'home' || view === 'product-detail' || view === 'checkout' || view === 'payment-processing' || view === 'payment-success')) ||
            (item.view === 'vendor-dashboard' && view === 'vendor-dashboard') ||
            (item.view === 'vendor-products' && view === 'vendor-products') ||
            (item.view === 'vendor-orders' && view === 'vendor-orders');
          
          return (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
