'use client';

import { Product, formatPrice, DELIVERY_ZONES, DELIVERY_FEE } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import {
  Heart,
  Star,
  Share2,
  Shield,
  Truck,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { setView, addToCart, deliveryZone, setDeliveryZone, paymentMethod, setPaymentMethod } = useAppStore();
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const total = product.price * quantity + DELIVERY_FEE;

  const isOutOfStock = product.stockQuantity === 0;

  const handleOrder = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setShowCheckoutModal(true);
  };

  const handlePayment = () => {
    setShowCheckoutModal(false);
    setView('checkout');
  };

  const isWave = paymentMethod === 'wave';

  return (
    <div className="pb-24">
      {/* Image Gallery */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {!imgErrors.has(currentImageIndex) ? (
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => {
              setImgErrors((prev) => new Set(prev).add(currentImageIndex));
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center">
            <span className="text-6xl opacity-60">📦</span>
          </div>
        )}

        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={() => setCurrentImageIndex((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            {currentImageIndex < product.images.length - 1 && (
              <button
                onClick={() => setCurrentImageIndex((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-white w-5' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Like & Share */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                liked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 pt-4">
        {/* Price */}
        <div className="mb-3">
          <span className="text-2xl font-extrabold text-orange-600">
            {formatPrice(product.price)}
          </span>
          {product.inStock && !isOutOfStock && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              En stock
            </span>
          )}
          {isOutOfStock && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Rupture de stock
            </span>
          )}
        </div>

        {/* Name */}
        <h1 className="text-lg font-bold text-gray-900 leading-snug mb-2">
          {product.name}
        </h1>

        {/* Vendor */}
        <div className="flex items-center gap-3 py-3 border-y border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm">
            {product.vendorName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{product.vendorName}</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-gray-600">{product.vendorRating}</span>
              </div>
            </div>
            <span className="text-xs text-gray-400">Vendeur vérifié</span>
          </div>
          <a
            href={`https://wa.me/${product.vendorWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>

        {/* Description */}
        <div className="py-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Delivery Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-900">Livraison à Abidjan</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">24-48h</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{formatPrice(DELIVERY_FEE)}</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-orange-50 rounded-xl p-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-900 block">Paiement Sécurisé</span>
              <span className="text-[10px] text-gray-500">Escrow WABUZ</span>
            </div>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-gray-900 block">Remboursement</span>
              <span className="text-[10px] text-gray-500">Si non livré</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar - Order Button */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Quantité</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                −
              </button>
              <span className="text-base font-bold text-gray-900 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <Button
            onClick={handleOrder}
            disabled={isOutOfStock}
            className={`w-full h-12 font-bold text-base rounded-xl shadow-lg transition-all active:scale-[0.98] ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
            }`}
          >
            {isOutOfStock ? 'En rupture de stock' : `Commander \u2212 ${formatPrice(total)}`}
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCheckoutModal(false)}
          />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-lg font-bold text-gray-900 mb-5">Finaliser la commande</h2>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-400">Qté: {quantity}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="text-gray-700">{formatPrice(product.price * quantity)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Livraison</span>
                  <span className="text-gray-700">{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Zone */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Zone de livraison
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_ZONES.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setDeliveryZone(zone)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      deliveryZone === zone
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Mode de paiement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('wave')}
                  className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'wave'
                      ? 'border-[#1DC3E0] bg-[#E8F9FC] shadow-md shadow-[#1DC3E0]/20'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  {paymentMethod === 'wave' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1DC3E0]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-[#1DC3E0] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700">Wave</span>
                  <span className="text-[9px] text-gray-400">Paiement instantané</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('orange_money')}
                  className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'orange_money'
                      ? 'border-[#FF6600] bg-[#FFF2E6] shadow-md shadow-[#FF6600]/20'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  {paymentMethod === 'orange_money' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6600]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-[#FF6600] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">OM</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700">Orange Money</span>
                  <span className="text-[9px] text-gray-400">Paiement mobile</span>
                </button>
              </div>
            </div>

            {/* Escrow Info */}
            <div className="bg-emerald-50 rounded-xl p-3 mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-emerald-800 block">Paiement Escrow Sécurisé</span>
                <span className="text-[9px] text-emerald-600">Votre argent est bloqué jusqu'à la livraison confirmée</span>
              </div>
              <Shield className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            </div>

            <Button
              onClick={handlePayment}
              disabled={!deliveryZone}
              className={`w-full h-12 font-bold text-base rounded-xl shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] ${
                isWave
                  ? 'bg-[#1DC3E0] hover:bg-[#1ab5d1] text-white shadow-[#1DC3E0]/30'
                  : 'bg-[#FF6600] hover:bg-[#e85d00] text-white shadow-[#FF6600]/30'
              }`}
            >
              {isWave ? 'Payer avec Wave' : 'Payer avec Orange Money'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
