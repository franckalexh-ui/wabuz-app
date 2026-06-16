'use client';

import { MOCK_ORDERS, formatPrice, formatDate } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import {
  Clock,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

type OrderFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered';

export function VendorOrders() {
  const { updateOrderStatus } = useAppStore();
  const [filter, setFilter] = useState<OrderFilter>('all');

  const filteredOrders = filter === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter((o) => o.status === filter);

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
    pending: {
      label: 'En attente',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
    },
    paid: {
      label: 'Payé',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: <DollarSign className="w-4 h-4 text-blue-500" />,
    },
    shipped: {
      label: 'Expédié',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      icon: <Truck className="w-4 h-4 text-purple-500" />,
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

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-gray-900">Commandes</h2>
        <span className="text-xs text-gray-400">{MOCK_ORDERS.length} commandes</span>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status];
          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Order Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{order.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.buyerPhone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bgColor} ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{order.deliveryZone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 block">{formatPrice(order.totalPrice)}</span>
                  <span className="text-[10px] text-gray-400">x{order.quantity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status !== 'delivered' && (
                <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-2 bg-gray-50/50">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'paid')}
                      className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Confirmer paiement
                    </button>
                  )}
                  {order.status === 'paid' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="flex-1 py-2 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 transition-colors"
                    >
                      Marquer expédié
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                    >
                      Confirmer livraison
                    </button>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {formatDate(order.createdAt)}
                  </span>
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
