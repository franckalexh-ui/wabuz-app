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
  CircleDollarSign,
  XCircle,
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

export function VendorDashboard() {
  const { isStoreCreated, vendorStoreName, vendorStoreId, setView, vendorProducts, newOrderCount, clearNewOrderCount, setVendorPendingCount, setIsStoreCreated, setVendorStoreId } = useAppStore();

  // ── Resolve store_id: Zustand store OR localStorage fallback ──
  const [resolvedStoreId, setResolvedStoreId] = useState<string>(() => {
    if (vendorStoreId) return vendorStoreId;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wabuz_vendor_store_id') || '';
    }
    return '';
  });
  useEffect(() => {
    if (vendorStoreId) setResolvedStoreId(vendorStoreId);
  }, [vendorStoreId]);

  // ── Hydration guard ─────────────────────────────────────
  // After SSR hydration, window is available. If resolvedStoreId is still
  // empty (SSR couldn't read localStorage), read it now and sync back
  // to the Zustand store so all components see the store_id.
  useEffect(() => {
    if (!resolvedStoreId && typeof window !== 'undefined') {
      const stored = localStorage.getItem('wabuz_vendor_store_id');
      if (stored) {
        setResolvedStoreId(stored);
        setVendorStoreId(stored);
        setIsStoreCreated(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once after mount

  // ── Real orders from Supabase ────────────────────────────
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    // No store_id — can't fetch orders, but don't show error
    if (!isSupabaseConfigured || !resolvedStoreId) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    const { data } = await supabase
      .from('orders')
      .select('*, products(name, image_url, price)')
      .eq('store_id', resolvedStoreId)
      .order('created_at', { ascending: false });
    if (data) {
      const fetched = data as SupabaseOrder[];
      setOrders(fetched);
      setVendorPendingCount(fetched.filter((o) => o.status === 'pending').length);
    }
    setOrdersLoading(false);
  }, [setVendorPendingCount, resolvedStoreId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const refreshPendingCount = (updatedOrders: SupabaseOrder[]) => {
    setVendorPendingCount(updatedOrders.filter((o) => o.status === 'pending').length);
  };

  useEffect(() => {
    clearNewOrderCount();
  }, [clearNewOrderCount]);

  // No store at all — show setup wizard
  if (!isStoreCreated && !resolvedStoreId) {
    return <StoreSetup />;
  }

  // ── Action: update status in Supabase ────────────────────
  const handleQuickAction = async (orderId: string, nextStatus: 'paid' | 'shipped', revertStatus: 'pending' | 'paid') => {
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
    refreshPendingCount(
      orders.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o)
    );
  };

  // Compute stats
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const paidOrders = orders.filter((o) => o.status === 'paid').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const totalOrders = orders.length;
  const productCount = vendorProducts.length;

  // Recent orders (latest 3)
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="pb-4">
      {/* ── Gradient Header with Store Name + Revenue ─────────── */}
      <div className="mx-4 mt-4 mb-5 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/30">
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
              onClick={() => setView('vendor-store')}
              className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          {/* Revenue Summary */}
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

      {/* ── 3 Stat Cards (En attente, Payé, Expédié) ──────────── */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-5">
        <button
          onClick={() => setView('vendor-orders')}
          className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 block">{pendingOrders}</span>
          <p className="text-[10px] text-gray-400 mt-0.5">En attente</p>
        </button>

        <button
          onClick={() => setView('vendor-orders')}
          className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 block">{paidOrders}</span>
          <p className="text-[10px] text-gray-400 mt-0.5">Payées</p>
        </button>

        <button
          onClick={() => setView('vendor-orders')}
          className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
            <Truck className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 block">{shippedOrders}</span>
          <p className="text-[10px] text-gray-400 mt-0.5">Expédiées</p>
        </button>
      </div>

      {/* ── Quick Add Product CTA ──────────────────────────────── */}
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

      {/* ── Commandes Récentes (last 3) ────────────────────────── */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">Commandes récentes</h3>
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
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{productName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(order.total_amount)}</span>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleQuickAction(order.id, 'paid', 'pending')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors whitespace-nowrap"
                      >
                        Confirmer
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleQuickAction(order.id, 'shipped', 'paid')}
                        className="px-2.5 py-1 rounded-lg bg-purple-500 text-white text-[10px] font-bold hover:bg-purple-600 transition-colors whitespace-nowrap"
                      >
                        Expédier
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[9px] font-medium whitespace-nowrap">
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
      {c.label}
    </span>
  );
}

function StoreSetup() {
  const { setVendorStore, setIsStoreCreated, setVendorStoreId, setView } = useAppStore();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [category, setCategory] = useState('');
  const [step, setStep] = useState(0);

  // ── Store name availability check ───────────────────
  const [isNameTaken, setIsNameTaken] = useState(false);
  const [isNameChecking, setIsNameChecking] = useState(false);

  useEffect(() => {
    if (!name || name.trim().length < 3) {
      setIsNameTaken(false);
      setIsNameChecking(false);
      return;
    }

    setIsNameChecking(true);
    const timer = setTimeout(async () => {
      if (!isSupabaseConfigured) {
        setIsNameChecking(false);
        return;
      }
      const { data } = await supabase
        .from('stores')
        .select('name')
        .eq('name', name.trim())
        .limit(1);

      setIsNameTaken(data && data.length > 0);
      setIsNameChecking(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [name]);

  const CATEGORIES = [
    { value: 'smartphones', label: 'Smartphones', icon: '📱' },
    { value: 'informatique', label: 'Informatique', icon: '💻' },
    { value: 'mode', label: 'Mode', icon: '👗' },
    { value: 'beaute', label: 'Beauté & Cosmétiques', icon: '💄' },
    { value: 'maison', label: 'Maison & Cuisine', icon: '🏠' },
    { value: 'electromenager', label: 'Électroménager', icon: '🔌' },
    { value: 'auto', label: 'Auto & Moto', icon: '🚗' },
    { value: 'autre', label: 'Autre', icon: '📦' },
  ];

  // WhatsApp validation: exactly 10 digits starting with 0
  const isWhatsappValid = /^0[0-9]{9}$/.test(whatsapp.replace(/\s/g, ''));
  const showWhatsappError = whatsapp.length > 0 && !isWhatsappValid;

  const handleCreate = async () => {
    if (name && isWhatsappValid && category && !isNameTaken) {
      const phone = whatsapp.replace(/\D/g, '');

      // Try inserting into Supabase to catch duplicate key (23505)
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('stores')
          .insert([{ name: name.trim(), phone, whatsapp, category }])
          .select('id');

        if (error) {
          if (error.code === '23505') {
            // Duplicate key — could be name OR phone
            toast({
              title: 'Doublon détecté',
              description: 'Ce numéro de téléphone ou nom de boutique est déjà utilisé.',
              variant: 'destructive',
            });
            // Check if it's the name that's taken
            const { data: nameCheck } = await supabase
              .from('stores')
              .select('name')
              .eq('name', name.trim())
              .limit(1);
            if (nameCheck && nameCheck.length > 0) {
              setIsNameTaken(true);
              setStep(0);
            }
            return;
          }
          // Other errors — still proceed locally
          console.warn('Store insert error (non-duplicate):', error.message);
        }

        // Save the real store_id from Supabase
        if (data && Array.isArray(data) && data.length > 0 && data[0].id) {
          const storeId = String(data[0].id);
          setVendorStoreId(storeId);
          console.log('Store created with ID:', storeId);
        }
      }

      setVendorStore(name.trim(), phone, whatsapp, category);
      setIsStoreCreated(true);
      setView('vendor-dashboard');
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

      {/* Step 0: Welcome + Store Name */}
      {step === 0 && (
        <>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Créez votre boutique</h2>
            <p className="text-sm text-gray-500">En 5 minutes, vos produits sont en ligne !</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Nom de la boutique <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ma Boutique CI"
                className={`w-full h-14 px-4 rounded-xl border text-base focus:outline-none focus:ring-2 transition-all ${
                  isNameTaken
                    ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                    : name.trim().length >= 3 && !isNameChecking
                      ? 'border-emerald-400 focus:ring-emerald-500/30 focus:border-emerald-500'
                      : 'border-gray-200 focus:ring-orange-500/30 focus:border-orange-500'
                }`}
              />
              {/* Availability feedback */}
              {isNameChecking && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                  <span className="text-[11px] text-gray-400">Vérification...</span>
                </div>
              )}
              {!isNameChecking && isNameTaken && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[11px] text-red-500 font-medium">Ce nom de boutique est déjà utilisé.</span>
                </div>
              )}
              {!isNameChecking && !isNameTaken && name.trim().length >= 3 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 font-medium">Nom disponible</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => name.trim() && !isNameTaken && setStep(1)}
              disabled={!name.trim() || isNameTaken || isNameChecking}
              className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              Suivant
            </Button>
          </div>
        </>
      )}

      {/* Step 1: WhatsApp + Category */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Numéro de téléphone <span className="text-gray-400 font-normal">(Joignable sur WhatsApp et Appels)</span> <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+225</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="07 XX XX XX XX"
                className={`w-full h-14 pl-14 pr-4 rounded-xl border text-base focus:outline-none focus:ring-2 transition-all ${
                  showWhatsappError
                    ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-gray-200 focus:ring-orange-500/30 focus:border-orange-500'
                }`}
              />
            </div>
            {showWhatsappError ? (
              <p className="text-[11px] text-red-500 mt-1 font-medium">
                Numéro invalide. Entrez 10 chiffres (ex: 07XXXXXXXX).
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1">Vos clients vous contacteront via ce numéro</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Catégorie principale <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2.5 h-12 px-4 rounded-xl border text-sm font-medium transition-all ${
                    category === cat.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setStep(0)}
              variant="outline"
              className="flex-1 h-14 rounded-xl font-semibold text-base"
            >
              Retour
            </Button>
            <Button
              onClick={() => isWhatsappValid && category && setStep(2)}
              disabled={!isWhatsappValid || !category}
              className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Confirm */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-xs text-gray-400 mb-3">Aperçu de votre boutique</p>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              {name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">+225 {whatsapp}</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <MessageCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">WhatsApp connecté</span>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                {CATEGORIES.find((c) => c.value === category)?.icon}{' '}
                {CATEGORIES.find((c) => c.value === category)?.label}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1 h-14 rounded-xl font-semibold text-base"
            >
              Retour
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30"
            >
              Créer ma boutique
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
