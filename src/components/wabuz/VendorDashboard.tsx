'use client';

import { useAppStore } from '@/lib/store';
import { formatPrice, DELIVERY_FEE, CATEGORIES } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Package,
  DollarSign,
  ShoppingBag,
  Plus,
  Store,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Bell,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap,
  MessageCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

/** Supabase order shape with product join. */
interface SupabaseOrder {
  id: string;
  product_id: string;
  store_id: string;
  client_phone: string;
  delivery_zone: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  escrow_status: 'held' | 'released';
  payment_method: 'wave' | 'orange_money';
  created_at: string;
  products: {
    name: string;
    image_url: string | null;
    price: number;
  } | null;
}

const STORE_ID = 'a1b2c3d4-1234-5678-9101-e11213141516';

export function VendorDashboard() {
  const { isStoreCreated, vendorStoreName, setView, vendorProducts, newOrderCount, clearNewOrderCount, setVendorPendingCount } = useAppStore();

  // ── Real orders from Supabase ────────────────────────────
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    if (!isSupabaseConfigured) { setOrdersLoading(false); return; }
    const { data } = await supabase
      .from('orders')
      .select('*, products(name, image_url, price)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });
    if (data) {
      const fetched = data as SupabaseOrder[];
      setOrders(fetched);
      // Sync pending count with the global store (for BottomNav badge)
      setVendorPendingCount(fetched.filter((o) => o.status === 'pending').length);
    }
    setOrdersLoading(false);
  }, [setVendorPendingCount]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Update pending count after quick action
  const refreshPendingCount = (updatedOrders: SupabaseOrder[]) => {
    setVendorPendingCount(updatedOrders.filter((o) => o.status === 'pending').length);
  };

  // Clear notification badge when viewing dashboard
  useEffect(() => {
    clearNewOrderCount();
  }, [clearNewOrderCount]);

  if (!isStoreCreated) {
    return <StoreSetup />;
  }

  // ── Action: update status in Supabase ────────────────────
  const handleQuickAction = async (orderId: string, nextStatus: 'paid' | 'shipped', revertStatus: 'pending' | 'paid') => {
    // Optimistic UI
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
      if (error) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: revertStatus } : o));
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        return;
      }
    }
    const labels = { paid: 'Paiement confirmé', shipped: 'Commande expédiée' };
    toast({ title: labels[nextStatus], description: `Commande #${orderId.slice(-4)} mise à jour` });
    // Refresh pending count after action
    refreshPendingCount(
      orders.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o)
    );
  };

  // Compute stats from Supabase orders
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const paidOrders = orders.filter((o) => o.status === 'paid').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const totalOrders = orders.length;
  const productCount = vendorProducts.length;
  const inStockCount = vendorProducts.filter((p) => p.inStock).length;

  // Recent orders (latest 3)
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="pb-6">
      {/* Store Header Card */}
      <div className="mx-4 mt-4 mb-5 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                {vendorStoreName ? vendorStoreName.charAt(0).toUpperCase() : 'W'}
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">{vendorStoreName || 'Ma Boutique'}</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-white/80" />
                  <span className="text-[11px] text-white/80">Boutique active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setView('vendor-products')}
              className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          {/* Mini Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <span className="text-lg font-extrabold block">{productCount}</span>
              <span className="text-[10px] text-white/70">Produits</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <span className="text-lg font-extrabold block">{totalOrders}</span>
              <span className="text-[10px] text-white/70">Commandes</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <span className="text-sm font-extrabold block">{formatPrice(totalRevenue)}</span>
              <span className="text-[10px] text-white/70">Revenus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Product CTA */}
      <div className="px-4 mb-5">
        <button
          onClick={() => setView('vendor-add-product')}
          className="w-full flex items-center gap-3 bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-4 hover:bg-orange-100 hover:border-orange-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-bold text-gray-900 block">Ajouter un nouveau produit</span>
            <span className="text-xs text-gray-500">Photo, prix, catégorie — en 2 minutes</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setView('vendor-orders')}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            {pendingOrders > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingOrders}
              </span>
            )}
          </div>
          <span className="text-xl font-extrabold text-gray-900">{pendingOrders}</span>
          <p className="text-[11px] text-gray-400">En attente</p>
        </button>

        <button
          onClick={() => setView('vendor-orders')}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            {paidOrders > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                {paidOrders}
              </span>
            )}
          </div>
          <span className="text-xl font-extrabold text-gray-900">{paidOrders}</span>
          <p className="text-[11px] text-gray-400">Payées</p>
        </button>

        <button
          onClick={() => setView('vendor-orders')}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-gray-900">{shippedOrders}</span>
          <p className="text-[11px] text-gray-400">Expédiées</p>
        </button>

        <button
          onClick={() => setView('vendor-products')}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-gray-900">{inStockCount}/{productCount}</span>
          <p className="text-[11px] text-gray-400">En stock</p>
        </button>
      </div>



      {/* Incoming Orders Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">Commandes entrantes</h3>
            {pendingOrders > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                {pendingOrders} nouvelle{pendingOrders > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => setView('vendor-orders')}
            className="text-xs font-semibold text-orange-500 flex items-center gap-0.5"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {ordersLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-2.5">
            {recentOrders.map((order) => {
              const product = order.products;
              const productImage = product?.image_url || '';
              const productName = product?.name || 'Produit';
              return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="p-3.5 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{productName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-[11px] text-gray-400">{order.delivery_zone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-gray-400">{order.client_phone}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(order.total_amount)}</span>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleQuickAction(order.id, 'paid', 'pending')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors"
                      >
                        Confirmer
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleQuickAction(order.id, 'shipped', 'paid')}
                        className="px-2.5 py-1 rounded-lg bg-purple-500 text-white text-[10px] font-bold hover:bg-purple-600 transition-colors"
                      >
                        Expédier
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[9px] font-medium">
                        ⏳ Attente client
                      </span>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl py-10 text-center">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm font-medium text-gray-500">Aucune commande pour le moment</p>
            <p className="text-xs text-gray-400 mt-0.5">Vos commandes client apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'En attente', color: 'text-amber-700', bgColor: 'bg-amber-50' },
    paid: { label: 'Payé', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    shipped: { label: 'Expédié', color: 'text-purple-700', bgColor: 'bg-purple-50' },
    delivered: { label: 'Livré', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${c.bgColor} ${c.color}`}>
      {status === 'pending' && <AlertCircle className="w-2.5 h-2.5" />}
      {status === 'paid' && <DollarSign className="w-2.5 h-2.5" />}
      {status === 'shipped' && <Truck className="w-2.5 h-2.5" />}
      {status === 'delivered' && <CheckCircle2 className="w-2.5 h-2.5" />}
      {c.label}
    </span>
  );
}

function StoreSetup() {
  const { setVendorStore, setIsStoreCreated } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [step, setStep] = useState(0);

  const handleCreate = () => {
    if (name && phone) {
      setVendorStore(name, phone, whatsapp || phone);
      setIsStoreCreated(true);
      toast({ title: 'Boutique créée !', description: `${name} est maintenant en ligne` });
    }
  };

  return (
    <div className="px-4 pt-6 pb-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i <= step ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            {i < 2 && (
              <div className={`w-8 h-0.5 ${i < step ? 'bg-orange-500' : 'bg-gray-100'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Créez votre boutique</h2>
          <p className="text-sm text-gray-500">En 5 minutes, vos produits sont en ligne !</p>
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nom de la boutique <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ma Boutique CI"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            />
          </div>
          <Button
            onClick={() => name && setStep(1)}
            disabled={!name}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50"
          >
            Suivant
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Numéro de téléphone <span className="text-red-400">*</span></label>
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
          <div className="flex gap-3">
            <Button
              onClick={() => setStep(0)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              Retour
            </Button>
            <Button
              onClick={() => phone && setStep(2)}
              disabled={!phone}
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-xs text-gray-400 mb-3">Aperçu de votre boutique</p>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              {name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{phone}</p>
            {whatsapp && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-green-600 font-medium">WhatsApp connecté</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              Retour
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30"
            >
              Créer ma boutique
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
