'use client';

import { useAppStore, EscrowStatus } from '@/lib/store';
import { formatPrice, DELIVERY_FEE } from '@/lib/data';
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  Shield,
  Package,
  Lock,
  ArrowRight,
  X,
  AlertTriangle,
  ChevronDown,
  Smartphone,
  KeyRound,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// ── Wave / Orange Money Brand Colors ─────────────────────────
const WAVE_COLOR = '#1DC3E0';
const WAVE_BG = '#E8F9FC';
const OM_COLOR = '#FF6600';
const OM_BG = '#FFF2E6';

// ── Escrow Timeline Step ─────────────────────────────────────
interface TimelineStep {
  label: string;
  detail: string;
  status: 'done' | 'active' | 'pending';
  icon: React.ReactNode;
}

function EscrowTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="w-full space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                step.status === 'done'
                  ? 'bg-emerald-500'
                  : step.status === 'active'
                  ? 'bg-orange-500 ring-4 ring-orange-100'
                  : 'bg-gray-100'
              }`}
            >
              {step.status === 'active' ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : step.status === 'done' ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Clock className="w-4 h-4 text-gray-300" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-0.5 h-8 transition-colors duration-500 ${
                  step.status === 'done' ? 'bg-emerald-300' : 'bg-gray-100'
                }`}
              />
            )}
          </div>
          {/* Text */}
          <div className="pb-4">
            <p
              className={`text-sm font-semibold transition-colors ${
                step.status === 'done'
                  ? 'text-emerald-600'
                  : step.status === 'active'
                  ? 'text-gray-900'
                  : 'text-gray-300'
              }`}
            >
              {step.label}
            </p>
            <p
              className={`text-[11px] mt-0.5 transition-colors ${
                step.status === 'pending' ? 'text-gray-200' : 'text-gray-400'
              }`}
            >
              {step.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Escrow Shield Animation ──────────────────────────────────
function EscrowShield({ status }: { status: EscrowStatus }) {
  const isActive = status === 'held' || status === 'collecting';
  return (
    <div className="relative">
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-700 ${
          status === 'held'
            ? 'bg-amber-100 shadow-lg shadow-amber-200/50'
            : status === 'released'
            ? 'bg-emerald-100 shadow-lg shadow-emerald-200/50'
            : 'bg-gray-100'
        }`}
      >
        {status === 'released' ? (
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        ) : (
          <Lock
            className={`w-10 h-10 transition-colors duration-500 ${
              isActive ? 'text-amber-500' : 'text-gray-300'
            }`}
          />
        )}
      </div>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export function CheckoutFlow() {
  const {
    cart,
    deliveryZone,
    paymentMethod,
    setPaymentStatus,
    paymentStatus,
    escrowStatus,
    setEscrowStatus,
    setLastOrderId,
    lastOrderId,
    setView,
    clearCart,
    resetCheckout,
    addClientOrder,
    setClientProfile,
    clientPhone: storedPhone,
    clientFirstName: storedFirstName,
    clientLastName: storedLastName,
    clientLoggedIn,
  } = useAppStore();

  const [step, setStep] = useState<
    'confirming' | 'processing' | 'escrow-held' | 'success'
  >(paymentStatus === 'success' ? 'success' : 'confirming');
  const [showEscrowDetail, setShowEscrowDetail] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // ── OTP / Phone Verification State ──────────────────────
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(clientLoggedIn && !!storedPhone);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showOtpBanner, setShowOtpBanner] = useState(false);

  // ── Client Profile State (Step 3) ───────────────────────
  const [clientFirstName, setClientFirstName] = useState(storedFirstName || '');
  const [clientLastName, setClientLastName] = useState(storedLastName || '');
  const isProfileComplete = clientFirstName.trim().length >= 2;

  // ── Pre-fill phone from stored profile ───────────────────
  const [phoneNumber, setPhoneNumber] = useState(storedPhone || '');

  // Validate Ivorian phone format: 07/05/01 XX XX XX XX
  const isPhoneValid = /^(07|05|01)\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(phoneNumber.replace(/\s/g, ''));
  const isOtpValid = otpInput.length === 4 && /^\d{4}$/.test(otpInput);

  const handleSendOtp = useCallback(() => {
    if (!isPhoneValid) return;
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setOtpCode(code);
    setOtpSent(true);
    setOtpError(null);
    setOtpInput('');
    setPhoneVerified(false);
    setShowOtpBanner(true);
    // Auto-hide banner after 15 seconds
    setTimeout(() => setShowOtpBanner(false), 15000);
  }, [isPhoneValid]);

  const handleVerifyOtp = useCallback(() => {
    if (!otpCode || !isOtpValid) return;
    if (otpInput === otpCode) {
      setPhoneVerified(true);
      setOtpError(null);
      setShowOtpBanner(false);
    } else {
      setOtpError('Code incorrect. Réessayez.');
    }
  }, [otpCode, otpInput, isOtpValid]);

  const itemsTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const total = itemsTotal + (cart.length > 0 ? DELIVERY_FEE : 0);
  const isWave = paymentMethod === 'wave';
  const brandColor = isWave ? WAVE_COLOR : OM_COLOR;
  const brandBg = isWave ? WAVE_BG : OM_BG;

  // ── Step 2: Processing with progress bar ────────────────
  useEffect(() => {
    if (step !== 'processing') return;

    setPaymentStatus('processing');
    setEscrowStatus('collecting');

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 400);

    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setEscrowStatus('held');
      const newOrderId = `WAB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      setLastOrderId(newOrderId);

      // ── Persist each order to Supabase, then add to local store ──
      // We do the inserts first so we can capture the returned UUID and store
      // it on the local ClientOrder. That UUID is later used by the
      // "Confirmer la réception" button to release the escrow in Supabase.
      (async () => {
        const now = new Date().toISOString();

        for (let idx = 0; idx < cart.length; idx++) {
          const item = cart[idx];
          const localId = idx === 0 ? newOrderId : `${newOrderId}-${idx + 1}`;
          const totalAmount = item.product.price * item.quantity + DELIVERY_FEE;

          const { data, error } = await supabase
            .from('orders')
            .insert([
              {
                product_id: item.product.id,
                store_id: item.product.vendorId, // for products fetched from Supabase this is the store UUID
                client_phone: phoneVerified ? `225${phoneNumber.replace(/\s/g, '')}` : '2250700000000',
                delivery_zone: deliveryZone,
                total_amount: totalAmount,
                status: 'pending', // nouvel ordre — le vendeur doit confirmer le paiement
                escrow_status: 'held', // argent bloqué en Escrow
                payment_method: paymentMethod, // 'wave' ou 'orange_money'
              },
            ])
            .select();

          if (error) {
            console.error(
              "Erreur lors de l'enregistrement de la commande:",
              error,
            );
            toast({
              title: 'Commande non sauvegardée',
              description: `Une erreur est survenue pendant l'enregistrement de la commande (${item.product.name}).`,
              variant: 'destructive',
            });
            // Still add to local store so the user sees the order, but without
            // a supabaseId — confirmation will only update local state.
            addClientOrder({
              id: localId,
              productName: item.product.name,
              productImage: item.product.images[0],
              vendorName: item.product.vendorName,
              vendorPhone: item.product.vendorPhone,
              deliveryZone,
              totalAmount,
              status: 'pending',
              escrowStatus: 'held',
              paymentMethod,
              quantity: item.quantity,
              createdAt: now,
            });
          } else {
            console.log(
              'Commande enregistrée avec succès dans Supabase pour',
              item.product.name,
            );
            const insertedRow = Array.isArray(data) && data.length > 0 ? data[0] : null;
            addClientOrder({
              id: localId,
              productName: item.product.name,
              productImage: item.product.images[0],
              vendorName: item.product.vendorName,
              vendorPhone: item.product.vendorPhone,
              deliveryZone,
              totalAmount,
              status: 'pending',
              escrowStatus: 'held',
              paymentMethod,
              quantity: item.quantity,
              createdAt: now,
              supabaseId: insertedRow?.id ? String(insertedRow.id) : undefined,
            });
          }
        }

        // ── Decrement stock_quantity for each product purchased ──
        for (const item of cart) {
          try {
            // First read current stock
            const { data: productData } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.product.id)
              .single();

            if (productData && typeof productData.stock_quantity === 'number') {
              const newStock = Math.max(0, productData.stock_quantity - item.quantity);
              await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.product.id);
            }
          } catch (stockErr) {
            console.error('Failed to decrement stock for', item.product.id, stockErr);
            // Non-blocking: order is still placed even if stock update fails
          }
        }
      })();

      setTimeout(() => setStep('escrow-held'), 600);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [step, setPaymentStatus, setEscrowStatus, setLastOrderId, cart, deliveryZone, paymentMethod, addClientOrder]);

  const handleConfirmPayment = useCallback(() => {
    // Block payment if any cart item is out of stock
    const outOfStockItem = cart.find((item) => item.product.stockQuantity === 0);
    if (outOfStockItem) {
      toast({
        title: 'Rupture de stock',
        description: `${outOfStockItem.product.name} n'est plus disponible.`,
        variant: 'destructive',
      });
      return;
    }

    // Save client profile to store + localStorage before processing
    if (phoneVerified && isProfileComplete && phoneNumber) {
      setClientProfile(
        `225${phoneNumber.replace(/\s/g, '')}`,
        clientFirstName.trim(),
        clientLastName.trim()
      );
    }
    setProcessingProgress(0);
    setStep('processing');
  }, [phoneVerified, isProfileComplete, phoneNumber, clientFirstName, clientLastName, setClientProfile, cart]);

  const handleContinueShopping = useCallback(() => {
    clearCart();
    setView('home');
    resetCheckout();
  }, [clearCart, setView, resetCheckout]);

  // ── Escrow Timeline Steps based on current status ────────
  const getEscrowSteps = (): TimelineStep[] => [
    {
      label: 'Paiement initié',
      detail: isWave
        ? 'Envoi de la demande Wave...'
        : 'Envoi de la demande Orange Money...',
      status: 'done',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      label: 'Argent collecté',
      detail: `${formatPrice(total)} prélevé sur votre compte`,
      status:
        escrowStatus === 'collecting'
          ? 'active'
          : ['held', 'released'].includes(escrowStatus)
          ? 'done'
          : 'pending',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      label: 'Escrow WABUZ actif',
      detail: 'Fonds bloqués en sécurité jusqu\'à la livraison',
      status:
        escrowStatus === 'held'
          ? 'active'
          : escrowStatus === 'released'
          ? 'done'
          : 'pending',
      icon: <Lock className="w-4 h-4" />,
    },
    {
      label: 'Livraison confirmée',
      detail: 'Le vendeur reçoit l\'argent après votre confirmation',
      status: escrowStatus === 'released' ? 'done' : 'pending',
      icon: <Package className="w-4 h-4" />,
    },
  ];

  // ══════════════════════════════════════════════════════════
  // SUCCESS VIEW
  // ══════════════════════════════════════════════════════════
  if (step === 'success') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
            <span className="text-lg">🎉</span>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          {clientFirstName
            ? `Merci ${clientFirstName} !`
            : 'Paiement Confirmé !'}
        </h2>
        <p className="text-sm text-gray-500 mb-2 max-w-xs">
          Votre commande a été enregistrée. Le vendeur sera notifié et vous
          recevrez une confirmation par WhatsApp.
        </p>

        {/* Order ID Badge */}
        {lastOrderId && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 mb-6">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-mono font-bold text-gray-600">
              {lastOrderId}
            </span>
          </div>
        )}

        {/* Order Details Card */}
        <div className="w-full bg-gray-50 rounded-2xl p-5 mb-4 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-900">
              Détails de la commande
            </span>
          </div>
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 mb-3 last:mb-0"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-gray-700">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Livraison à {deliveryZone}</span>
              <span className="text-gray-700">
                {formatPrice(DELIVERY_FEE)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-orange-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Escrow Status Card */}
        <div className="w-full bg-amber-50 rounded-2xl p-4 mb-4 text-left">
          <div className="flex items-center gap-3">
            <EscrowShield status="held" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-800">
                  Escrow Actif
                </span>
              </div>
              <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                Vos <span className="font-bold">{formatPrice(total)}</span> sont
                bloqués en toute sécurité. Le vendeur ne recevra l&apos;argent
                qu&apos;après votre confirmation de réception.
              </p>
            </div>
          </div>

          {/* Mini Escrow Flow */}
          <div className="mt-4 flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100">
              <span className="text-[10px] font-bold text-blue-700">Vous</span>
            </div>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 ring-2 ring-amber-300">
              <Lock className="w-2.5 h-2.5 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700">
                Escrow WABUZ
              </span>
            </div>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
              <span className="text-[10px] font-bold text-gray-400">
                Vendeur
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="w-full bg-orange-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <TruckIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 block">
              Livraison estimée
            </span>
            <span className="text-xs text-gray-500">
              24-48 heures à {deliveryZone}
            </span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Button
            onClick={handleContinueShopping}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
          >
            Continuer mes achats
          </Button>
          <button
            onClick={() => {
              resetCheckout();
              setView('orders');
            }}
            className="w-full py-3 text-sm text-gray-500 hover:text-orange-600 transition-colors font-medium"
          >
            Suivre ma commande
          </button>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // ESCROW HELD VIEW (money is now locked)
  // ══════════════════════════════════════════════════════════
  if (step === 'escrow-held') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-6 pb-24 text-center">
        {/* Big Escrow Shield */}
        <div className="mb-6 animate-in zoom-in duration-500">
          <EscrowShield status="held" />
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Argent bloqué en Escrow
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Vos <span className="font-bold text-gray-900">{formatPrice(total)}</span>{' '}
          sont sécurisés. Le vendeur ne reçoit rien tant que vous n&apos;avez pas
          confirmé la réception.
        </p>

        {/* Full Escrow Timeline */}
        <div className="w-full bg-gray-50 rounded-2xl p-5 mb-5 text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-900">
              Suivi Escrow
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
              <Lock className="w-2.5 h-2.5" />
              En attente de livraison
            </span>
          </div>
          <EscrowTimeline steps={getEscrowSteps()} />
        </div>

        {/* How Escrow Works - expandable */}
        <button
          onClick={() => setShowEscrowDetail(!showEscrowDetail)}
          className="w-full flex items-center justify-between bg-blue-50 rounded-2xl p-4 mb-5 text-left"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-blue-800">
              Comment fonctionne l&apos;Escrow ?
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-blue-400 transition-transform ${
              showEscrowDetail ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showEscrowDetail && (
          <div className="w-full space-y-3 mb-5 animate-in slide-in-from-top duration-200">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Vous payez</p>
                  <p className="text-[11px] text-gray-500">
                    L&apos;argent est prélevé de votre compte{' '}
                    {isWave ? 'Wave' : 'Orange Money'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-gray-200 rotate-90" />
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-600">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    WABUZ bloque les fonds
                  </p>
                  <p className="text-[11px] text-gray-500">
                    L&apos;argent est conservé en toute sécurité sur un compte
                    Escrow WABUZ
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-gray-200 rotate-90" />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-600">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Vous confirmez la réception
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Après vérification du colis, vous confirmez la livraison
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-gray-200 rotate-90" />
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-600">
                  4
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Le vendeur est payé
                  </p>
                  <p className="text-[11px] text-gray-500">
                    L&apos;argent est transféré au vendeur automatiquement
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Notice */}
            <div className="bg-red-50 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-red-700 block">
                  Remboursement automatique
                </span>
                <span className="text-[10px] text-red-500">
                  Si le vendeur ne livre pas dans les 7 jours, vous êtes
                  remboursé intégralement
                </span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => {
            setPaymentStatus('success');
            setStep('success');
          }}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
        >
          Voir le récapitulatif
        </Button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // PROCESSING VIEW (with progress bar + escrow animation)
  // ══════════════════════════════════════════════════════════
  if (step === 'processing') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
        {/* Branded Spinner */}
        <div className="relative mb-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandBg }}
          >
            <Loader2
              className="w-14 h-14 animate-spin"
              style={{ color: brandColor }}
            />
          </div>
          {/* Payment method badge */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-[10px] font-bold shadow-md"
            style={{ backgroundColor: brandColor }}
          >
            {isWave ? 'Wave' : 'Orange Money'}
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isWave
            ? 'En attente de validation Wave...'
            : 'En attente de validation Orange Money...'}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Veuillez confirmer le paiement de{' '}
          <span className="font-bold text-gray-900">{formatPrice(total)}</span>{' '}
          sur votre téléphone
        </p>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Traitement en cours...</span>
            <span>{Math.min(Math.round(processingProgress), 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(processingProgress, 100)}%`,
                backgroundColor: brandColor,
              }}
            />
          </div>
        </div>

        {/* Simulation Steps */}
        <div className="w-full space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-emerald-600 font-medium">
              Commande créée
            </span>
          </div>
          <div className="flex items-center gap-3">
            {processingProgress > 50 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                style={{ borderColor: brandColor, borderTopColor: 'transparent' }}
              />
            )}
            <span
              className={`text-sm font-medium ${
                processingProgress > 50 ? 'text-emerald-600' : 'text-gray-900'
              }`}
            >
              {processingProgress > 50
                ? 'Paiement validé'
                : 'Validation du paiement...'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {processingProgress > 80 ? (
              <div
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 animate-spin"
                style={{
                  borderColor: brandColor,
                  borderTopColor: 'transparent',
                }}
              />
            ) : (
              <Clock className="w-5 h-5 text-gray-200 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                processingProgress > 80
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-300'
              }`}
            >
              Activation de l&apos;Escrow...
            </span>
          </div>
        </div>

        {/* Escrow Info */}
        <div className="w-full bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="text-xs font-semibold text-amber-800 block">
              Paiement Sécurisé Escrow
            </span>
            <span className="text-[11px] text-amber-600">
              Votre argent sera bloqué en sécurité jusqu&apos;à la livraison
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // CONFIRMING VIEW (payment method selection summary)
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-[75vh] flex flex-col px-6 py-6 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: brandBg }}
        >
          {isWave ? (
            <WaveLogo />
          ) : (
            <OrangeMoneyLogo />
          )}
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">
          {isWave ? 'Payer avec Wave' : 'Payer avec Orange Money'}
        </h2>
        <p className="text-sm text-gray-500">
          Vous allez être redirigé vers{' '}
          {isWave ? 'Wave' : 'Orange Money'} pour finaliser le paiement
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-4">
        <div className="text-center mb-4">
          <span className="text-3xl font-extrabold text-gray-900">
            {formatPrice(total)}
          </span>
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

      {/* Escrow Badge - Prominent */}
      <div className="bg-emerald-50 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-emerald-800 block">
              Paiement Escrow Sécurisé
            </span>
            <span className="text-[11px] text-emerald-600 leading-relaxed">
              Le vendeur reçoit l&apos;argent uniquement après votre
              confirmation de réception
            </span>
          </div>
        </div>

        {/* Mini flow visualization */}
        <div className="mt-3 flex items-center justify-between px-2">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
              <span className="text-[10px]">💳</span>
            </div>
            <span className="text-[9px] text-emerald-600 font-medium mt-1">
              Vous payez
            </span>
          </div>
          <div className="flex-1 mx-2 border-t-2 border-dashed border-emerald-200" />
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[9px] text-emerald-600 font-medium mt-1">
              Escrow WABUZ
            </span>
          </div>
          <div className="flex-1 mx-2 border-t-2 border-dashed border-emerald-200" />
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-[10px]">🏪</span>
            </div>
            <span className="text-[9px] text-gray-400 font-medium mt-1">
              Vendeur
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Info */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ backgroundColor: brandBg }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: brandColor }}
          >
            {isWave ? 'W' : 'OM'}
          </div>
          <div className="text-left flex-1">
            <span className="text-sm font-bold text-gray-900 block">
              {isWave ? 'Compte Wave' : 'Compte Orange Money'}
            </span>
            <span className="text-xs text-gray-500">
              Confirmez sur votre téléphone après avoir cliqué
            </span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          OTP / PHONE VERIFICATION
          ═════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">Vérification du numéro</h3>
          {phoneVerified && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
          )}
        </div>

        {/* Phone Input */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium flex-shrink-0">
            <span className="text-base">🇨🇮</span>
            <span>+225</span>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9\s]/g, '');
              if (val.replace(/\s/g, '').length <= 10) {
                setPhoneNumber(val);
              }
            }}
            placeholder="07 XX XX XX XX"
            disabled={phoneVerified}
            className={`flex-1 h-11 px-3 rounded-xl border text-sm font-medium transition-colors ${
              phoneVerified
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-gray-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500'
            }`}
          />
        </div>

        {/* Send OTP Button */}
        {!otpSent && !phoneVerified && (
          <Button
            onClick={handleSendOtp}
            disabled={!isPhoneValid}
            className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Recevoir le code de validation
          </Button>
        )}

        {/* OTP Sent Banner (simulated SMS) */}
        {showOtpBanner && otpCode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 animate-pulse">
            <div className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-800 block">
                  Simulation SMS — Code de vérification WABUZ
                </span>
                <span className="text-lg font-extrabold text-amber-900 tracking-widest">
                  {otpCode}
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5">
                  Entrez ce code ci-dessous pour vérifier votre numéro
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OTP Input */}
        {otpSent && !phoneVerified && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={otpInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 4) setOtpInput(val);
                }}
                placeholder="0000"
                maxLength={4}
                className="flex-1 h-11 px-3 rounded-xl border border-gray-200 text-center text-lg font-extrabold tracking-[0.3em] focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
              <Button
                onClick={handleVerifyOtp}
                disabled={!isOtpValid}
                className="h-11 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Vérifier
              </Button>
            </div>
            {otpError && (
              <p className="text-xs text-red-500 font-medium">{otpError}</p>
            )}
            <button
              onClick={handleSendOtp}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Renvoyer le code
            </button>
          </div>
        )}

        {/* Verified badge */}
        {phoneVerified && (
          <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">
              Numéro vérifié : +225 {phoneNumber}
            </span>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          CLIENT PROFILE (Step 3 — after phone verified)
          ═════════════════════════════════════════════════════════ */}
      {phoneVerified && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900">Vos informations</h3>
            {isProfileComplete && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
            )}
          </div>

          <div className="space-y-2">
            {/* First Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Prénom *</label>
              <input
                type="text"
                value={clientFirstName}
                onChange={(e) => setClientFirstName(e.target.value)}
                placeholder="Ex: Aminata"
                className={`w-full h-11 px-3 rounded-xl border text-sm font-medium transition-colors ${
                  isProfileComplete
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-gray-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500'
                }`}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Nom</label>
              <input
                type="text"
                value={clientLastName}
                onChange={(e) => setClientLastName(e.target.value)}
                placeholder="Ex: Koné"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium transition-colors focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Profile complete badge */}
          {isProfileComplete && (
            <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                Profil complet : {clientFirstName}{clientLastName ? ` ${clientLastName}` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Confirm Payment Button */}
      <Button
        onClick={handleConfirmPayment}
        disabled={!phoneVerified || !isProfileComplete}
        className={`w-full h-13 font-bold text-base rounded-xl shadow-lg transition-all active:scale-[0.98] ${
          phoneVerified && isProfileComplete
            ? isWave
              ? 'bg-[#1DC3E0] hover:bg-[#1ab5d1] text-white shadow-[#1DC3E0]/30'
              : 'bg-[#FF6600] hover:bg-[#e85d00] text-white shadow-[#FF6600]/30'
            : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
        }`}
        style={{ height: '52px' }}
      >
        {!phoneVerified
          ? '🔒 Vérifiez votre numéro d\'abord'
          : !isProfileComplete
          ? '🔒 Entrez votre prénom pour continuer'
          : isWave ? '💳 Payer avec Wave' : '📱 Payer avec Orange Money'
        }
      </Button>

      <button
        onClick={() => {
          resetCheckout();
          setView('product-detail');
        }}
        className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors text-center w-full"
      >
        Annuler
      </button>
    </div>
  );
}

// ── Custom SVG Logos ─────────────────────────────────────────
function WaveLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#1DC3E0" />
      <path
        d="M10 22C10 22 14 16 20 16C26 16 30 22 30 22"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M10 26C10 26 14 20 20 20C26 20 30 26 30 26"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function OrangeMoneyLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#FF6600" />
      <circle cx="20" cy="18" r="6" stroke="white" strokeWidth="2.5" fill="none" />
      <rect x="14" y="25" width="12" height="3" rx="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
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
