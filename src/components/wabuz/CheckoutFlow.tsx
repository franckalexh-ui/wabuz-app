'use client';

import { useAppStore } from '@/lib/store';
import { formatPrice, DELIVERY_FEE } from '@/lib/data';
import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  Smartphone,
  Shield,
  PartyPoppper,
  Package,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckoutFlow() {
  const { cart, deliveryZone, paymentMethod, setPaymentStatus, paymentStatus, setView, clearCart } = useAppStore();
  const [step, setStep] = useState<'confirming' | 'processing' | 'success'>(paymentStatus === 'success' ? 'success' : 'confirming');

  const itemsTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = itemsTotal + (cart.length > 0 ? DELIVERY_FEE : 0);

  // Simulate payment processing
  useEffect(() => {
    if (step === 'processing') {
      setPaymentStatus('processing');
      const timer = setTimeout(() => {
        setStep('success');
        setPaymentStatus('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, setPaymentStatus]);

  const handleConfirmPayment = () => {
    setStep('processing');
  };

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
            <span className="text-lg">🎉</span>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Paiement Confirmé !</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          Votre commande a été enregistrée. Le vendeur sera notifié et vous recevrez une confirmation par WhatsApp.
        </p>

        {/* Order Details */}
        <div className="w-full bg-gray-50 rounded-2xl p-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-900">Détails de la commande</span>
          </div>
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-gray-700">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Livraison à {deliveryZone}</span>
              <span className="text-gray-700">{formatPrice(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-orange-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="w-full bg-orange-50 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <Truck className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-900 block">Livraison estimée</span>
            <span className="text-xs text-gray-500">24-48 heures à {deliveryZone}</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Button
            onClick={() => {
              clearCart();
              setView('home');
              setPaymentStatus('idle');
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
          >
            Continuer mes achats
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-14 h-14 text-[#1DC3E0] animate-spin" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {paymentMethod === 'wave' ? 'En attente de validation Wave...' : 'En attente de validation Orange Money...'}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Veuillez confirmer le paiement de <span className="font-bold text-gray-900">{formatPrice(total)}</span> sur votre téléphone
        </p>

        {/* Simulation Steps */}
        <div className="w-full space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Commande créée</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#1DC3E0] border-t-transparent animate-spin flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Validation du paiement en cours...</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-300 flex-shrink-0" />
            <span className="text-sm text-gray-400">Confirmation de la commande</span>
          </div>
        </div>

        <div className="w-full bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="text-xs font-semibold text-amber-800 block">Paiement Sécurisé Escrow</span>
            <span className="text-[11px] text-amber-600">Votre argent est protégé jusqu&apos;à la livraison</span>
          </div>
        </div>
      </div>
    );
  }

  // Confirming step
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
        <Smartphone className="w-10 h-10 text-[#1DC3E0]" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {paymentMethod === 'wave' ? 'Payer avec Wave' : 'Payer avec Orange Money'}
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Vous allez être redirigé vers {paymentMethod === 'wave' ? 'Wave' : 'Orange Money'} pour finaliser le paiement
      </p>

      {/* Payment Summary */}
      <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 text-left">
        <div className="text-center mb-4">
          <span className="text-3xl font-extrabold text-gray-900">{formatPrice(total)}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Articles ({cart.length})</span>
            <span className="text-gray-700">{formatPrice(itemsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Livraison</span>
            <span className="text-gray-700">{formatPrice(DELIVERY_FEE)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-orange-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Escrow Badge */}
      <div className="w-full bg-emerald-50 rounded-xl p-4 mb-8 flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <div className="text-left">
          <span className="text-xs font-semibold text-emerald-800 block">Paiement Escrow Sécurisé</span>
          <span className="text-[11px] text-emerald-600">Le vendeur reçoit l&apos;argent uniquement après votre confirmation de réception</span>
        </div>
      </div>

      <Button
        onClick={handleConfirmPayment}
        className={`w-full h-12 font-bold text-base rounded-xl shadow-lg transition-all active:scale-[0.98] ${
          paymentMethod === 'wave'
            ? 'bg-[#1DC3E0] hover:bg-[#1ab5d1] text-white shadow-[#1DC3E0]/30'
            : 'bg-[#FF6600] hover:bg-[#e85d00] text-white shadow-[#FF6600]/30'
        }`}
      >
        Confirmer le paiement
      </Button>

      <button
        onClick={() => setView('product-detail')}
        className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Annuler
      </button>
    </div>
  );
}

// Re-export Truck icon for the success view
function Truck({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}
