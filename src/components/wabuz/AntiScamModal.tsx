'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AntiScamModalProps {
  /** Force show regardless of localStorage (e.g. on first checkout) */
  forceShow?: boolean;
  /** Callback when user dismisses the modal */
  onDismiss?: () => void;
}

const STORAGE_KEY = 'wabuz_seen_warning';

export function AntiScamModal({ forceShow = false, onDismiss }: AntiScamModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check if user has already seen the warning
    const seen = localStorage.getItem(STORAGE_KEY);
    if (forceShow || !seen) {
      setVisible(true);
    }
  }, [forceShow]);

  const handleDismiss = () => {
    // Mark as seen so it never shows again on this device
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-orange-600 p-5 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sécurité WABUZ</h2>
              <p className="text-xs text-white/80">Protégez vos achats</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Warning icon + title */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Attention aux arnaques !</p>
            </div>
          </div>

          {/* Warning text */}
          <div className="text-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              Pour garantir vos achats, <strong>tous les paiements DOIVENT être faits via l&apos;application WABUZ</strong> avec l&apos;Escrow (argent bloqué).
            </p>
            <p className="bg-red-50 rounded-xl p-3 border border-red-100">
              <strong className="text-red-700">Si un vendeur vous demande d&apos;envoyer de l&apos;argent directement</strong> par Wave/OM sur WhatsApp, <strong className="text-red-700">REFUSEZ</strong>.
            </p>
            <p className="text-gray-500 text-xs">
              WABUZ ne pourra pas vous rembourser si vous payez en dehors de l&apos;app.
            </p>
          </div>

          {/* Escrow reminder */}
          <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5 border border-emerald-100">
            <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-800 block">Escrow = Protection</span>
              <span className="text-[10px] text-emerald-600">Votre argent est bloqué jusqu&apos;à confirmation de livraison</span>
            </div>
          </div>

          {/* Dismiss button */}
          <Button
            onClick={handleDismiss}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30"
          >
            J&apos;ai compris
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Helper: check if warning has been seen ──────────────────────
export function hasSeenAntiScamWarning(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

// ── Helper: mark warning as seen ─────────────────────────────────
export function markAntiScamWarningSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, 'true');
}
