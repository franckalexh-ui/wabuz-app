'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Lock,
  Unlock,
  MessageCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Clock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { AntiScamModal } from '@/components/wabuz/AntiScamModal';

// ── Types ────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

interface SupabaseOrder {
  id: string;
  product_id: string;
  store_id: string;
  client_phone: string;
  delivery_zone: string;
  total_amount: number;
  status: OrderStatus;
  escrow_status: 'held' | 'released';
  payment_method: 'wave' | 'orange_money';
  created_at: string;
  products: {
    name: string;
    image_url: string | null;
    price: number;
  } | null;
}

// ── Helpers ──────────────────────────────────────────────────
const formatFCFA = (amount: number) =>
  `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// ── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'En attente', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  paid:    { label: 'Payé',      color: 'text-blue-700',   bgColor: 'bg-blue-100'   },
  shipped: { label: 'Expédié',   color: 'text-purple-700', bgColor: 'bg-purple-100' },
  delivered:{ label: 'Livré',    color: 'text-emerald-700', bgColor: 'bg-emerald-100'},
};

// ── Component ────────────────────────────────────────────────
export default function ClientOrders() {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'delivered'>('active');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // ── Anti-Scam Modal State ──────────────────────────────
  const [showAntiScam, setShowAntiScam] = useState(false);
  const [pendingWhatsappUrl, setPendingWhatsappUrl] = useState<string | null>(null);

  const handleAntiScamDismiss = () => {
    localStorage.setItem('wabuz_seen_warning', 'true');
    setShowAntiScam(false);
    // Now open WhatsApp with the pending URL
    if (pendingWhatsappUrl) {
      window.open(pendingWhatsappUrl, '_blank');
      setPendingWhatsappUrl(null);
    }
  };

  // ── Fetch orders from Supabase ─────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Supabase non configuré');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*, products(name, image_url, price)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setOrders([]);
    } else if (data) {
      setOrders(data as SupabaseOrder[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Supabase Realtime subscription ─────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as Partial<SupabaseOrder>;
          if (updated.id) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id
                  ? { ...o, status: updated.status ?? o.status, escrow_status: updated.escrow_status ?? o.escrow_status }
                  : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Confirm receipt (delivered + release escrow) ───────────
  const handleConfirm = async (orderId: string) => {
    if (!window.confirm('Confirmez-vous avoir reçu votre colis en bon état ? Les fonds seront libérés au vendeur.')) {
      return;
    }

    setConfirmingId(orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'delivered', escrow_status: 'released' }
          : o
      )
    );

    if (isSupabaseConfigured) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'delivered', escrow_status: 'released' })
        .eq('id', orderId);

      if (updateError) {
        // Revert on error
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: 'shipped', escrow_status: 'held' }
              : o
          )
        );
        toast({
          title: 'Erreur',
          description: `Impossible de confirmer: ${updateError.message}`,
          variant: 'destructive',
        });
        setConfirmingId(null);
        return;
      }
    }

    toast({
      title: 'Réception confirmée 🎉',
      description: "L'escrow a été libéré au vendeur.",
    });
    setConfirmingId(null);
  };

  // ── Derived data ───────────────────────────────────────────
  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'paid' || o.status === 'shipped'
  );
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  // ── Order Card ─────────────────────────────────────────────
  const OrderCard = ({ order }: { order: SupabaseOrder }) => {
    const isShipped = order.status === 'shipped';
    const isDelivered = order.status === 'delivered';
    const isPaid = order.status === 'paid';
    const isPending = order.status === 'pending';
    const isEscrowHeld = order.escrow_status === 'held';
    // Client can confirm receipt only when order is shipped
    const canConfirm = isShipped;
    const isConfirming = confirmingId === order.id;
    const product = order.products;
    const productName = product?.name || 'Produit';
    const productImage = product?.image_url || '';
    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
          <div>
            <p className="text-xs text-gray-500 font-medium">Commande #{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-sm font-bold text-gray-900">{productName}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.bgColor} ${statusCfg.color}`}>
            {statusCfg.label}
          </div>
        </div>

        {/* Body */}
        <div className="flex gap-4 p-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{productName}</h3>
            <p className="text-xs text-gray-500 mt-1">Livraison: {order.delivery_zone}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
            <div className="flex items-center gap-2 mt-2">
              {isEscrowHeld && !isDelivered ? (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Lock size={12} /> Escrow bloqué
                </span>
              ) : isDelivered ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <Unlock size={12} /> Escrow libéré
                </span>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">{formatFCFA(order.total_amount)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {order.payment_method === 'wave' ? 'Wave' : 'Orange Money'}
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className={`flex flex-col items-center ${!isPending ? 'text-emerald-600' : ''}`}>
              <CheckCircle2 size={16} className={!isPending ? 'fill-emerald-100' : ''} />
              <span className="mt-1">Payé</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${isShipped || isDelivered ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${isShipped || isDelivered ? 'text-emerald-600' : ''}`}>
              <Truck size={16} />
              <span className="mt-1">Expédié</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${isDelivered ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${isDelivered ? 'text-emerald-600' : ''}`}>
              <Package size={16} />
              <span className="mt-1">Livré</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={() => {
              const phone = order.client_phone;
              const vendorName = order.products?.name || 'vendeur';
              const deliveryZone = order.delivery_zone || 'Abidjan';
              const message = encodeURIComponent(
                `Bonjour, je vous contacte concernant ma commande WABUZ pour "${vendorName}" (Escrow actif). Je souhaite organiser ma livraison à ${deliveryZone}.`
              );
              const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;

              // Anti-scam gate: show warning once per device before opening WhatsApp
              const hasSeenWarning = localStorage.getItem('wabuz_seen_warning');
              if (!hasSeenWarning) {
                setPendingWhatsappUrl(whatsappUrl);
                setShowAntiScam(true);
              } else {
                window.open(whatsappUrl, '_blank');
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={16} className="text-green-600" />
            Contacter
          </button>

          {canConfirm && (
            <button
              onClick={() => handleConfirm(order.id)}
              disabled={isConfirming}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConfirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirmation…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirmer la réception
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-extrabold text-gray-900 text-center">Mes Commandes</h1>

          <div className="flex mt-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              En cours ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'delivered' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Terminées ({deliveredOrders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-600">Chargement de vos commandes…</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Impossible de charger les commandes</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {activeTab === 'active' ? (
              activeOrders.length > 0 ? (
                activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="text-center py-20">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Aucune commande en cours</p>
                  <p className="text-gray-400 text-sm mt-1">Vos achats apparaîtront ici</p>
                </div>
              )
            ) : (
              deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="text-center py-20">
                  <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Aucune commande terminée</p>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Anti-Scam Modal — shown once per device when first clicking Contacter */}
      {showAntiScam && <AntiScamModal onClose={handleAntiScamDismiss} />}
    </div>
  );
}
