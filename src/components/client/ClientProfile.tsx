'use client';

import { useAppStore } from '@/lib/store';
import {
  User,
  Phone,
  LogOut,
  ChevronRight,
  Shield,
  ShoppingBag,
  HelpCircle,
  ArrowRightLeft,
  MapPin,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// WhatsApp support link (dummy number for V1)
const WHATSAPP_SUPPORT_URL = 'https://wa.me/2250700000000?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide%20sur%20WABUZ';

export function ClientProfile() {
  const {
    clientLoggedIn,
    clientFirstName,
    clientLastName,
    clientPhone,
    clientLogout,
    setView,
    setMode,
    getActiveOrdersCount,
  } = useAppStore();

  const activeOrders = getActiveOrdersCount();

  const handleLogout = () => {
    clientLogout();
  };

  const handleSwitchToVendor = () => {
    setMode('vendor');
  };

  const handleHelpWhatsApp = () => {
    window.open(WHATSAPP_SUPPORT_URL, '_blank');
  };

  return (
    <div className="px-4 pt-4 pb-6">
      {/* ── Profile Header (Jumia-inspired gradient card) ────────── */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 rounded-2xl p-5 text-white relative overflow-hidden mb-5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 border border-white/30">
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

      {/* ── Account Status Banner ─────────────────────────────────── */}
      {clientLoggedIn ? (
        <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5 mb-5">
          <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-bold text-emerald-800 block">Compte vérifié</span>
            <span className="text-[10px] text-emerald-600">Votre compte WABUZ est actif</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      ) : (
        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-2.5 mb-5">
          <ShoppingBag className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-bold text-orange-800 block">Bienvenue sur WABUZ !</span>
            <span className="text-[10px] text-orange-600">Faites votre première commande pour commencer</span>
          </div>
        </div>
      )}

      {/* ── Quick Stats (3-column) ─────────────────────────────────── */}
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
          <MessageCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <span className="text-[10px] text-gray-400">Messages</span>
        </button>
      </div>

      {/* ── Menu List (Jumia-style with chevrons) ─────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-5">
        <MenuItem
          icon={<ShoppingBag className="w-4 h-4 text-orange-500" />}
          label="Mes Commandes"
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
          icon={<ArrowRightLeft className="w-4 h-4 text-violet-500" />}
          label="Basculer en Mode Vendeur"
          subtitle="Gérez votre boutique et vos produits"
          onClick={handleSwitchToVendor}
        />
        <MenuItem
          icon={<HelpCircle className="w-4 h-4 text-blue-500" />}
          label="Aide & Assistance"
          subtitle="Contactez-nous sur WhatsApp"
          onClick={handleHelpWhatsApp}
        />
      </div>

      {/* ── Settings Section (Static V1) ──────────────────────────── */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Paramètres
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900 block">Pays</span>
              <span className="text-[11px] text-gray-400 block">Côte d'Ivoire</span>
            </div>
            <span className="text-xs text-gray-400">🇨🇮</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900 block">Langue</span>
              <span className="text-[11px] text-gray-400 block">Français</span>
            </div>
            <span className="text-xs text-gray-400">FR</span>
          </div>
        </div>
      </div>

      {/* ── Logout Button ──────────────────────────────────────────── */}
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

      {/* ── Version tag ─────────────────────────────────────────────── */}
      <p className="text-center text-[10px] text-gray-300 mt-6">
        WABUZ v1.0 · Abidjan
      </p>
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
