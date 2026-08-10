'use client';

import { useAppStore } from '@/lib/store';
import {
  User,
  Phone,
  LogOut,
  ChevronRight,
  Shield,
  ShoppingBag,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ClientProfile() {
  const {
    clientLoggedIn,
    clientFirstName,
    clientLastName,
    clientPhone,
    clientLogout,
    setView,
    getActiveOrdersCount,
  } = useAppStore();

  const activeOrders = getActiveOrdersCount();

  const handleLogout = () => {
    clientLogout();
  };

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 rounded-2xl p-5 text2 text-white relative overflow-hidden mb-5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {clientLoggedIn && clientFirstName
              ? clientFirstName.charAt(0).toUpperCase()
              : 'W'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold leading-tight">
              {clientLoggedIn && clientFirstName
                ? `Bonjour ${clientFirstName}`
                : 'Bienvenue sur WABUZ'}
            </h2>
            <p className="text-sm text-white/80 mt-0.5">
              {clientLoggedIn && clientLastName
                ? `${clientFirstName} ${clientLastName}`
                : 'Marché de confiance en Côte d\'Ivoire'}
            </p>
            {clientLoggedIn && clientPhone && (
              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3 h-3 text-white/70" />
                <span className="text-xs text-white/70 font-mono">
                  +{clientPhone}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Status */}
      {clientLoggedIn ? (
        <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5 mb-5">
          <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-bold text-emerald-800 block">Compte vérifié</span>
            <span className="text-[10px] text-emerald-600">Votre compte invisible WABUZ est actif</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      ) : (
        <div className="bg-amber-50 rounded-xl p-3 flex# flex items-center gap-2.5 mb-5">
          <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-bold text-amber-800 block">Compte non créé</span>
            <span className="text-[10px] text-amber-600">Faites une première commande pour créer votre compte invisible</span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button
          onClick={() => setView('orders')}
          className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-lg font-extrabold text-gray-900 block">{activeOrders}</span>
          <span className="text-[10px] text-gray-400">En cours</span>
        </button>
        <button
          onClick={() => setView('home')}
          className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:shadow-md transition-shadow"
        >
          <ShoppingBag className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <span className="text-[10px] text-gray-400">Commander</span>
        </button>
        <button
          className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:shadow-md transition-shadow"
        >
          <Bell className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <span className="text-[10px] text-gray-400">Alertes</span>
        </button>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-5">
        <MenuItem
          icon={<ShoppingBag className="w-4 h-4 text-orange-500" />}
          label="Mes commandes"
          subtitle={activeOrders > 0 ? `${activeOrders} commande${activeOrders > 1 ? 's' : ''} en cours` : 'Aucune commande en cours'}
          onClick={() => setView('orders')}
        />
        <MenuItem
          icon={<Shield className="w-4 h-4 text-emerald-500" />}
          label="Paiement Escrow"
          subtitle="Vos fonds sont protégés jusqu'à la livraison"
          onClick={() => {}}
        />
        <MenuItem
          icon={<HelpCircle className="w-4 h-4 text-blue-500" />}
          label="Aide & Support"
          subtitle="FAQ, WhatsApp, contact"
          onClick={() => {}}
        />
      </div>

      {/* Logout Button */}
      {clientLoggedIn && (
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      )}
    </div>
  );
}

// ── Menu Item Sub-component ────────────────────────────────────
function MenuItem({
  icon,
  label,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-900 block">{label}</span>
        <span className="text-[11px] text-gray-400 truncate block">{subtitle}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </button>
  );
}
