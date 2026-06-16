'use client';

import { useAppStore } from '@/lib/store';
import { formatPrice, formatDate, DELIVERY_FEE } from '@/lib/data';
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
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type OrderFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered';

export function VendorOrders() {
  const { vendorOrders, updateOrderStatus } = useAppStore();
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = filter === 'all'
    ? vendorOrders
    : vendorOrders.filter((o) => o.status === filter);

  // Count per status
  const counts = {
    all: vendorOrders.length,
    pending: vendorOrders.filter((o) => o.status === 'pending').length,
    paid: vendorOrders.filter((o) => o.status === 'paid').length,
    shipped: vendorOrders.filter((o) => o.status === 'shipped').length,
    delivered: vendorOrders.filter((o) => o.status === 'delivered').length,
  };

  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode; nextAction?: { label: string; color: string; nextStatus: 'paid' | 'shipped' | 'delivered' } }> = {
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
      nextAction: { label: 'Confirmer la livraison', color: 'bg-emerald-500 hover:bg-emerald-600', nextStatus: 'delivered' },
    },
    delivered: {
      label: 'Livré',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
  };

  const filters: { key: OrderFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'paid', label: 'Payées' },
    { key: 'shipped', label: 'Expédiées' },
    { key: 'delivered', label: 'Livrées' },
  ];

  const handleAction = (orderId: string, nextStatus: 'paid' | 'shipped' | 'delivered') => {
    updateOrderStatus(orderId, nextStatus);
    const statusLabels = { paid: 'Paiement confirmé', shipped: 'Commande expédiée', delivered: 'Livraison confirmée' };
    toast({
      title: statusLabels[nextStatus],
      description: `La commande #${orderId.slice(-4)} a été mise à jour`,
    });
  };

  return (
    <div className="pb-6">
      {/* Summary Bar */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Commandes</h2>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">{vendorOrders.length} commande{vendorOrders.length > 1 ? 's' : ''}</span>
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
          {filters.map((f) => (
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

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.pending;
          const isExpanded = expandedOrder === order.id;

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                order.status === 'pending' ? 'border-amber-200 shadow-md shadow-amber-100/50' : 'border-gray-100 shadow-sm'
              }`}
            >
              {/* Order Header - Always Visible */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bgColor} ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-[10px] text-gray-400">#{order.id.slice(-4)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 block">{formatPrice(order.totalPrice)}</span>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Action for Pending/Paid/Shipped */}
                {config.nextAction && !isExpanded && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleAction(order.id, config.nextAction!.nextStatus)}
                      className={`flex-1 py-2.5 rounded-xl ${config.nextAction.color} text-white text-xs font-bold transition-colors active:scale-[0.98]`}
                    >
                      {config.nextAction.label}
                    </button>
                    <button
                      onClick={() => setExpandedOrder(order.id)}
                      className="px-3 py-2.5 rounded-xl border border-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors"
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
                      {order.buyerPhone.slice(-2)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{order.buyerPhone}</p>
                      <p className="text-[10px] text-gray-400">Acheteur</p>
                    </div>
                    <a
                      href={`https://wa.me/${order.buyerPhone.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-semibold hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Livraison</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900">{order.deliveryZone}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Paiement</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900">
                        {order.paymentMethod === 'wave' ? 'Wave' : 'Orange Money'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Quantité</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900">{order.quantity} article{order.quantity > 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Date</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Sous-total</span>
                      <span className="text-gray-700">{formatPrice(order.totalPrice - order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Livraison</span>
                      <span className="text-gray-700">{formatPrice(order.deliveryFee)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-1.5 flex justify-between">
                      <span className="text-xs font-bold text-gray-900">Total</span>
                      <span className="text-sm font-bold text-orange-600">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {config.nextAction && (
                    <button
                      onClick={() => handleAction(order.id, config.nextAction!.nextStatus)}
                      className={`w-full py-3 rounded-xl ${config.nextAction.color} text-white text-sm font-bold transition-colors active:scale-[0.98]`}
                    >
                      {config.nextAction.label}
                    </button>
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
    </div>
  );
}
