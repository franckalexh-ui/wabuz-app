'use client';

import { useAppStore } from '@/lib/store';
import {
  formatPrice,
  formatShortDate,
  ClientOrder,
  DELIVERY_FEE,
} from '@/lib/data';
import {
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Lock,
  Shield,
  MessageCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// ── Status Configuration ─────────────────────────────────────
type ClientOrderStatus = ClientOrder['status'];

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  step: number; // 1=pending, 2=paid, 3=shipped, 4=delivered
}

const STATUS_CONFIG: Record<ClientOrderStatus, StatusConfig> = {
  pending: {
    label: 'En attente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    step: 1,
  },
  paid: {
    label: 'Payé',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <CreditCard className="w-3.5 h-3.5 text-blue-500" />,
    step: 2,
  },
  shipped: {
    label: 'Expédié',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: <Truck className="w-3.5 h-3.5 text-purple-500" />,
    step: 3,
  },
  delivered: {
    label: 'Livré',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    step: 4,
  },
};

// ── Order Status Stepper ─────────────────────────────────────
function OrderStepper({ currentStatus }: { currentStatus: ClientOrderStatus }) {
  const currentStep = STATUS_CONFIG[currentStatus].step;
  const steps = [
    { num: 1, label: 'Commandé', icon: <ShoppingBag className="w-3 h-3" /> },
    { num: 2, label: 'Payé', icon: <CreditCard className="w-3 h-3" /> },
    { num: 3, label: 'Expédié', icon: <Truck className="w-3 h-3" /> },
    { num: 4, label: 'Livré', icon: <Package className="w-3 h-3" /> },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, i) => {
        const isDone = step.num <= currentStep;
        const isCurrent = step.num === currentStep;
        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDone
                    ? isCurrent
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                      : 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-300'
                }`}
              >
                {isDone && !isCurrent ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`text-[9px] font-medium transition-colors ${
                  isDone ? 'text-gray-700' : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mb-4 transition-colors duration-500 ${
                  step.num < currentStep ? 'bg-emerald-300' : 'bg-gray-100'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Escrow Status Banner ─────────────────────────────────────
function EscrowBanner({
  order,
}: {
  order: ClientOrder;
}) {
  if (order.escrowStatus === 'released') {
    return (
      <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold text-emerald-800 block">
            Escrow libéré
          </span>
          <span className="text-[10px] text-emerald-600">
            {order.deliveredAt
              ? `Fonds transférés au vendeur le ${formatShortDate(order.deliveredAt)}`
              : 'Fonds transférés au vendeur'}
          </span>
        </div>
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      </div>
    );
  }

  // escrowStatus === 'held'
  return (
    <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 relative">
        <Lock className="w-4 h-4 text-amber-600" />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      </div>
      <div className="flex-1">
        <span className="text-[11px] font-bold text-amber-800 block">
          Escrow actif − {formatPrice(order.totalAmount)} bloqués
        </span>
        <span className="text-[10px] text-amber-600">
          {order.status === 'shipped'
            ? 'Confirmez la réception pour libérer les fonds au vendeur'
            : 'Fonds sécurisés jusqu\'à la livraison confirmée'}
        </span>
      </div>
    </div>
  );
}

// ── Order Card ───────────────────────────────────────────────
function OrderCard({
  order,
  onConfirmReceipt,
  onToggleExpand,
  isExpanded,
}: {
  order: ClientOrder;
  onConfirmReceipt: (orderId: string) => void;
  onToggleExpand: (orderId: string) => void;
  isExpanded: boolean;
}) {
  const config = STATUS_CONFIG[order.status];
  const isWave = order.paymentMethod === 'wave';
  const canConfirm = order.status === 'shipped' && order.escrowStatus === 'held';

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        order.status === 'shipped'
          ? 'border-purple-200 shadow-md shadow-purple-100/40'
          : order.status === 'delivered'
          ? 'border-emerald-100 shadow-sm'
          : 'border-gray-100 shadow-sm'
      }`}
    >
      {/* Card Header */}
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
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
              {order.productName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bgColor} ${config.color}`}
              >
                {config.icon}
                {config.label}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                #{order.id}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900 block">
              {formatPrice(order.totalAmount)}
            </span>
            <button
              onClick={() => onToggleExpand(order.id)}
              className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Voir détails"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="mt-4">
          <OrderStepper currentStatus={order.status} />
        </div>

        {/* Escrow Banner - always visible for shipped/paid */}
        {(order.status === 'paid' ||
          order.status === 'shipped' ||
          order.status === 'delivered') && (
          <div className="mt-3">
            <EscrowBanner order={order} />
          </div>
        )}

        {/* Primary CTA for shipped orders */}
        {canConfirm && !isExpanded && (
          <button
            onClick={() => onConfirmReceipt(order.id)}
            className="w-full mt-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmer la réception
          </button>
        )}

        {/* Quick vendor WhatsApp for shipped */}
        {order.status === 'shipped' && (
          <div className="mt-2 flex items-center gap-2">
            <a
              href={`https://wa.me/${order.vendorPhone.replace(/\s/g, '').replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl border border-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3 h-3" />
              Contacter le vendeur
            </a>
            <button
              onClick={() => onToggleExpand(order.id)}
              className="px-3 py-2 rounded-xl border border-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors"
            >
              Détails
            </button>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-50 px-4 py-4 bg-gray-50/30 space-y-3">
          {/* Vendor Info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs">
              {order.vendorName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900">
                {order.vendorName}
              </p>
              <p className="text-[10px] text-gray-400">Vendeur</p>
            </div>
            <a
              href={`https://wa.me/${order.vendorPhone.replace(/\s/g, '').replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-semibold hover:bg-green-100 transition-colors"
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
                <span className="text-[10px] text-gray-400 font-medium">
                  Livraison
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-900">
                {order.deliveryZone}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-medium">
                  Paiement
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold ${
                    isWave ? 'bg-[#1DC3E0]' : 'bg-[#FF6600]'
                  }`}
                >
                  {isWave ? 'W' : 'OM'}
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  {isWave ? 'Wave' : 'Orange Money'}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-medium">
                  Quantité
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-900">
                {(order.quantity ?? 1)} article{(order.quantity ?? 1) > 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-medium">
                  Date
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-900">
                {formatShortDate(order.createdAt || '')}
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Sous-total</span>
              <span className="text-gray-700">
                {formatPrice(order.totalAmount - DELIVERY_FEE)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Livraison</span>
              <span className="text-gray-700">{formatPrice(DELIVERY_FEE)}</span>
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between">
              <span className="text-xs font-bold text-gray-900">Total</span>
              <span className="text-sm font-bold text-orange-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Confirm Receipt CTA (when shipped) */}
          {canConfirm && (
            <button
              onClick={() => onConfirmReceipt(order.id)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmer la réception
            </button>
          )}

          {/* Delivered State */}
          {order.status === 'delivered' && (
            <div className="flex items-center justify-center gap-2 py-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">
                Commande livrée et escrow libéré
              </span>
            </div>
          )}

          {/* Pending State Notice */}
          {order.status === 'pending' && (
            <div className="bg-amber-50 rounded-xl p-2.5 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-amber-600 leading-relaxed">
                En attente de confirmation du paiement par le vendeur. Vous
                serez notifié dès qu&apos;il sera validé.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Confirm Receipt Modal ────────────────────────────────────
function ConfirmReceiptModal({
  order,
  onConfirm,
  onCancel,
}: {
  order: ClientOrder | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
          Confirmer la réception ?
        </h2>
        <p className="text-xs text-gray-500 text-center mb-5 max-w-xs mx-auto">
          En confirmant, vous attestez avoir bien reçu votre commande en bon
          état. L&apos;escrow sera libéré et le vendeur recevra les fonds.
        </p>

        {/* Order Recap */}
        <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={order.productImage}
              alt={order.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 line-clamp-1">
              {order.productName}
            </p>
            <p className="text-[10px] text-gray-400">
              {order.vendorName} • #{order.id}
            </p>
          </div>
          <span className="text-xs font-bold text-gray-900">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        {/* Escrow Release Flow */}
        <div className="bg-amber-50 rounded-xl p-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-[9px] text-amber-700 font-medium mt-1">
                Escrow
              </span>
            </div>
            <ArrowRight className="w-3 h-3 text-amber-400" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[9px] text-emerald-700 font-medium mt-1">
                Libération
              </span>
            </div>
            <ArrowRight className="w-3 h-3 text-amber-400" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-[10px]">🏪</span>
              </div>
              <span className="text-[9px] text-gray-500 font-medium mt-1">
                Vendeur
              </span>
            </div>
          </div>
          <p className="text-[10px] text-amber-600 text-center mt-2">
            {formatPrice(order.totalAmount)} seront transférés à{' '}
            {order.vendorName}
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onConfirm}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30"
          >
            Oui, j&apos;ai bien reçu ma commande
          </Button>
          <button
            onClick={onCancel}
            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Pas encore, annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
type FilterKey = 'all' | 'active' | 'delivered';

export function ClientOrders() {
  const {
    clientOrders,
    activeClientOrderFilter,
    setClientOrderFilter,
    confirmReceipt,
    confirmingReceiptId,
    setConfirmingReceiptId,
  } = useAppStore();

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Filter orders
  const filteredOrders = clientOrders.filter((order) => {
    if (activeClientOrderFilter === 'active') {
      return order.status !== 'delivered';
    }
    if (activeClientOrderFilter === 'delivered') {
      return order.status === 'delivered';
    }
    return true;
  });

  // Counts
  const counts = {
    all: clientOrders.length,
    active: clientOrders.filter((o) => o.status !== 'delivered').length,
    delivered: clientOrders.filter((o) => o.status === 'delivered').length,
  };

  // Stats for header
  const inEscrow = clientOrders.filter((o) => o.escrowStatus === 'held').length;
  const totalEscrowAmount = clientOrders
    .filter((o) => o.escrowStatus === 'held')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'active', label: 'En cours' },
    { key: 'delivered', label: 'Livrées' },
  ];

  const orderToConfirm = confirmingReceiptId
    ? clientOrders.find((o) => o.id === confirmingReceiptId) || null
    : null;

  const handleConfirmReceipt = (orderId: string) => {
    setConfirmingReceiptId(orderId);
  };

  const handleConfirmModalConfirm = () => {
    if (orderToConfirm) {
      confirmReceipt(orderToConfirm.id);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 100);
      toast({
        title: 'Réception confirmée',
        description: `L'escrow a été libéré. ${orderToConfirm.vendorName} a reçu les fonds.`,
      });
    }
  };

  const handleConfirmModalCancel = () => {
    setConfirmingReceiptId(null);
  };

  const handleToggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-gray-900">Mes Commandes</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Suivez vos achats et confirmez la réception
        </p>
      </div>

      {/* Escrow Summary Card */}
      {inEscrow > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 relative">
                <Lock className="w-5 h-5 text-amber-600" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-amber-800 block">
                  {inEscrow} commande{inEscrow > 1 ? 's' : ''} en Escrow
                </span>
                <span className="text-[11px] text-amber-600">
                  {formatPrice(totalEscrowAmount)} sécurisés
                </span>
              </div>
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-gray-50 p-1 rounded-2xl">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setClientOrderFilter(f.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeClientOrderFilter === f.key
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              <span
                className={`ml-1.5 text-[10px] ${
                  activeClientOrderFilter === f.key
                    ? 'text-orange-400'
                    : 'text-gray-300'
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onConfirmReceipt={handleConfirmReceipt}
            onToggleExpand={handleToggleExpand}
            isExpanded={expandedOrder === order.id}
          />
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              {activeClientOrderFilter === 'delivered'
                ? 'Aucune commande livrée'
                : activeClientOrderFilter === 'active'
                ? 'Aucune commande en cours'
                : 'Aucune commande'}
            </h3>
            <p className="text-xs text-gray-400">
              {activeClientOrderFilter === 'all'
                ? 'Vos achats apparaîtront ici'
                : 'Essayez un autre filtre'}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Receipt Modal */}
      <ConfirmReceiptModal
        order={orderToConfirm}
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
      />
    </div>
  );
}
