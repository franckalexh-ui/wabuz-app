'use client';

import { formatPrice, formatDate, DELIVERY_FEE } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAppStore } from '@/lib/store';
import {
  Clock,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MapPin,
  CreditCard,
  Package,
  Lock,
  Shield,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// ── Types ────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';
type OrderFilter = 'all' | OrderStatus;

/** Shape returned by Supabase with the products join. */
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

/** Store ID for the demo vendor (same as the one in Supabase). */
const STORE_ID = 'a1b2c3d4-1234-5678-9101-e11213141516';

// ── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  nextAction?: { label: string; color: string; nextStatus: OrderStatus };
}> = {
  pending: {
    label: 'En attente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
    nextAction: { label: 'Confirmer le paiement', color: 'bg-blue-500 hover:bg-blue-600', nextStatus: 'paid' },
  },
  paid: {
    label: 'Payé',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: <DollarSign className="w-4 h-4 text-blue-500" />,
    nextAction: { label: 'Marquer expédié', color: 'bg-purple-500 hover:bg-purple-600', nextStatus: 'shipped' },
  },
  shipped: {
    label: 'Expédié',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: <Truck className="w-4 h-4 text-purple-500" />,
    // Vendors CANNOT mark as delivered — only the client can confirm receipt
  },
  delivered: {
    label: 'Livré',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
};

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'paid', label: 'Payées' },
  { key: 'shipped', label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
];

// ── Component ────────────────────────────────────────────────
export function VendorOrders() {
  const { setVendorPendingCount } = useAppStore();
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setOrders([]);
    } else if (data) {
      const fetched = data as SupabaseOrder[];
      setOrders(fetched);
      // Sync pending count with the global store (for BottomNav badge)
      setVendorPendingCount(fetched.filter((o) => o.status === 'pending').length);
    }
    setLoading(false);
  }, [setVendorPendingCount]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Action: update order status in Supabase ────────────────
  const handleAction = async (orderId: string, nextStatus: OrderStatus) => {
    setActionLoading(orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      )
    );

    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Remis en attente',
      paid: 'Paiement confirmé',
      shipped: 'Commande expédiée',
      delivered: 'Livraison confirmée',
    };

    if (isSupabaseConfigured) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);

      if (updateError) {
        // Revert on error
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: nextStatus === 'paid' ? 'pending' : nextStatus === 'shipped' ? 'paid' : 'shipped' } : o
          )
        );
        toast({
          title: 'Erreur',
          description: `Impossible de mettre à jour: ${updateError.message}`,
          variant: 'destructive',
        });
        setActionLoading(null);
        return;
      }
    }

    toast({
      title: statusLabels[nextStatus],
      description: `La commande #${orderId.slice(-4)} a été mise à jour`,
    });
    // Refresh pending count after status change
    setVendorPendingCount(
      orders.filter((o) => o.id !== orderId ? o.status === 'pending' : nextStatus === 'pending').length
    );
    setActionLoading(null);
  };

  // ── Derived data ───────────────────────────────────────────
  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const counts: Record<OrderFilter, number> = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="pb-6">
      {/* Summary Bar */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Commandes</h2>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
          {counts.pending > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
              <AlertCircle className="w-3 h-3" />
              {counts.pending} en attente
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === f.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`ml-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                  filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600">Chargement des commandes…</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
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
        <div className="px-4 space-y-3">
          {filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedOrder === order.id;
            const product = order.products;
            const productImage = product?.image_url || '';
            const productName = product?.name || 'Produit';
            const productPrice = product?.price || 0;
            const isActing = actionLoading === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  order.status === 'pending' ? 'border-amber-200 shadow-md shadow-amber-100/50' : 'border-gray-100 shadow-sm'
                }`}
              >
                {/* Order Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3">
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bgColor} ${config.color}`}>
                          {config.icon}
                          {config.label}
                        </span>
                        <span className="text-[10px] text-gray-400">#{order.id.slice(-4)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 block">{formatPrice(order.total_amount)}</span>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Action */}
                  {config.nextAction && !isExpanded && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleAction(order.id, config.nextAction!.nextStatus)}
                        disabled={isActing}
                        className={`flex-1 py-2.5 rounded-xl ${config.nextAction.color} text-white text-xs font-bold transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      >
                        {isActing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Mise à jour…
                          </>
                        ) : (
                          config.nextAction.label
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedOrder(order.id)}
                        className="px-3 py-2.5 rounded-xl border border-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Détails
                      </button>
                    </div>
                  )}

                  {/* Shipped — waiting for client confirmation */}
                  {order.status === 'shipped' && !isExpanded && (
                    <div className="mt-3 flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2.5">
                      <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-purple-700">En attente de confirmation du client</span>
                      <button
                        onClick={() => setExpandedOrder(order.id)}
                        className="ml-auto px-3 py-1 rounded-lg border border-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Détails
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 py-4 bg-gray-50/30 space-y-3">
                    {/* Buyer Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {order.client_phone.slice(-2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{order.client_phone}</p>
                        <p className="text-[10px] text-gray-400">Acheteur</p>
                      </div>
                      <a
                        href={`https://wa.me/${order.client_phone.replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-semibold hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>

                    {/* Escrow Status Banner for Paid Orders */}
                    {order.status === 'paid' && (
                      <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 mb-3">
                        <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold text-amber-800 block">Fonds en Escrow</span>
                          <span className="text-[10px] text-amber-600 leading-relaxed">
                            L&apos;argent du client est bloqué en sécurité. Il sera débloqué automatiquement après confirmation de livraison.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Escrow Released Banner for Delivered Orders */}
                    {order.status === 'delivered' && (
                      <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-[10px] text-emerald-700 font-medium">Escrow libéré − Le vendeur a reçu les fonds</span>
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">Livraison</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{order.delivery_zone}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">Paiement</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {order.payment_method === 'wave' ? 'Wave' : 'Orange Money'}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">Date</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">Escrow</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {order.escrow_status === 'held' ? 'Bloqué' : 'Libéré'}
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl p-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Sous-total</span>
                        <span className="text-gray-700">{formatPrice(order.total_amount - DELIVERY_FEE)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Livraison</span>
                        <span className="text-gray-700">{formatPrice(DELIVERY_FEE)}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-1.5 flex justify-between">
                        <span className="text-xs font-bold text-gray-900">Total</span>
                        <span className="text-sm font-bold text-orange-600">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Action Buttons — vendor can only advance to paid/shipped */}
                    {config.nextAction && (
                      <button
                        onClick={() => handleAction(order.id, config.nextAction!.nextStatus)}
                        disabled={isActing}
                        className={`w-full py-3 rounded-xl ${config.nextAction.color} text-white text-sm font-bold transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      >
                        {isActing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mise à jour…
                          </>
                        ) : (
                          config.nextAction.label
                        )}
                      </button>
                    )}

                    {/* Shipped — waiting for client to confirm receipt */}
                    {order.status === 'shipped' && (
                      <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2.5">
                        <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-purple-700">En attente de confirmation du client</span>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <div className="flex items-center justify-center gap-2 py-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">Commande livrée avec succès</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Aucune commande</h3>
              <p className="text-xs text-gray-400">Les nouvelles commandes apparaîtront ici</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
