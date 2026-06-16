'use client';

import { useAppStore } from '@/lib/store';
import { Search, ShoppingCart, ArrowLeft, Store, ShoppingBag, Bell } from 'lucide-react';

export function Header() {
  const { mode, view, goBack, setMode, getCartItemCount, setView, newOrderCount } = useAppStore();
  const cartCount = getCartItemCount();

  // Show back button for all views except the "root" views
  const showBack = view !== 'home' && view !== 'vendor-dashboard';
  const showLogo = view === 'home' || view === 'vendor-dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={goBack}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {showLogo && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-orange-500">WA</span>
                <span className="text-gray-900">BUZ</span>
              </span>
            </div>
          )}
          {!showLogo && !showBack && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <button
            onClick={() => setMode(mode === 'client' ? 'vendor' : 'client')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
          >
            {mode === 'client' ? (
              <>
                <Store className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-gray-700 hidden sm:inline">Mode Vendeur</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-gray-700 hidden sm:inline">Mode Client</span>
              </>
            )}
          </button>

          {/* Notification Bell (Vendor mode) */}
          {mode === 'vendor' && (
            <button
              onClick={() => setView('vendor-orders')}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {newOrderCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Icon (Client mode only) */}
          {mode === 'client' && (
            <button
              onClick={() => {}}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
