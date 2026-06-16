'use client';

import { useAppStore } from '@/lib/store';
import { formatPrice, MOCK_ORDERS, PRODUCTS } from '@/lib/data';
import {
  Package,
  DollarSign,
  ShoppingBag,
  Plus,
  Store,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function VendorDashboard() {
  const { isStoreCreated, vendorStoreName, setView, vendorOrders, vendorProducts } = useAppStore();
  const [showSetup, setShowSetup] = useState(false);

  if (!isStoreCreated && !showSetup) {
    return <StoreSetup />;
  }

  // Get stats
  const totalRevenue = MOCK_ORDERS.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = MOCK_ORDERS.filter((o) => o.status === 'pending' || o.status === 'paid').length;
  const totalOrders = MOCK_ORDERS.length;
  const vendorProductCount = PRODUCTS.length; // Using mock data for demo

  return (
    <div className="pb-6">
      {/* Store Header */}
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
            {vendorStoreName ? vendorStoreName.charAt(0) : 'W'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {vendorStoreName || 'Ma Boutique'}
            </h2>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Boutique active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">{formatPrice(totalRevenue)}</span>
          <p className="text-xs text-gray-400 mt-0.5">Revenus totaux</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">{totalOrders}</span>
          <p className="text-xs text-gray-400 mt-0.5">Commandes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">{pendingOrders}</span>
          <p className="text-xs text-gray-400 mt-0.5">En attente</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">{vendorProductCount}</span>
          <p className="text-xs text-gray-400 mt-0.5">Produits</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions rapides</h3>
        <div className="space-y-2">
          <button
            onClick={() => setView('vendor-add-product')}
            className="w-full flex items-center gap-3 bg-orange-50 rounded-xl p-4 hover:bg-orange-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-900 block">Ajouter un produit</span>
              <span className="text-xs text-gray-500">Mettez vos articles en ligne</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setView('vendor-orders')}
            className="w-full flex items-center gap-3 bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-900 block">Gérer les commandes</span>
              <span className="text-xs text-gray-500">{pendingOrders} en attente de traitement</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setView('vendor-products')}
            className="w-full flex items-center gap-3 bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-900 block">Mes produits</span>
              <span className="text-xs text-gray-500">{vendorProductCount} articles en ligne</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Commandes récentes</h3>
          <button
            onClick={() => setView('vendor-orders')}
            className="text-xs font-semibold text-orange-500"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-3">
          {MOCK_ORDERS.slice(0, 3).map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{order.productName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StatusIcon status={order.status} />
                  <span className="text-xs text-gray-400">{order.buyerPhone}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    case 'paid':
      return <DollarSign className="w-3.5 h-3.5 text-blue-500" />;
    case 'shipped':
      return <Truck className="w-3.5 h-3.5 text-purple-500" />;
    case 'delivered':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    default:
      return null;
  }
}

function StoreSetup() {
  const { setVendorStore, setIsStoreCreated } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleCreate = () => {
    if (name && phone) {
      setVendorStore(name, phone, whatsapp || phone);
      setIsStoreCreated(true);
    }
  };

  return (
    <div className="px-4 pt-8 pb-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Créez votre boutique</h2>
        <p className="text-sm text-gray-500">En 5 minutes, vos produits sont en ligne !</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nom de la boutique</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ma Boutique CI"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Numéro de téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+225 07 XX XX XX"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Lien WhatsApp (optionnel)</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="22507XXXXXXXX"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      <Button
        onClick={handleCreate}
        disabled={!name || !phone}
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 mt-6 disabled:opacity-50"
      >
        Créer ma boutique
      </Button>
    </div>
  );
}
