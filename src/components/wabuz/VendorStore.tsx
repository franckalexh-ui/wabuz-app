'use client';

import { useAppStore } from '@/lib/store';
import { formatPrice, CATEGORIES } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Store,
  Phone,
  MessageCircle,
  ShoppingBag,
  ArrowRightLeft,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Package,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// WhatsApp support link
const WHATSAPP_SUPPORT_URL = 'https://wa.me/2250700000000?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide%20pour%20ma%20boutique%20WABUZ';

export function VendorStore() {
  const {
    vendorStoreName,
    vendorPhone,
    vendorWhatsapp,
    vendorProducts,
    vendorStoreId,
    setMode,
    deleteVendorProduct,
    toggleProductStock,
    selectProduct,
    addVendorProduct,
  } = useAppStore();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Real products from Supabase ──────────────────────────
  const [storeProducts, setStoreProducts] = useState<typeof vendorProducts>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    // No store_id — can't fetch, show empty
    if (!isSupabaseConfigured || !vendorStoreId) {
      setStoreProducts([]);
      setProductsLoading(false);
      return;
    }
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', vendorStoreId)
      .order('created_at', { ascending: false });
    if (data) {
      const mapped = data.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        price: p.price,
        category: p.category || '',
        description: p.description || '',
        images: p.image_url ? [p.image_url] : [],
        vendorId: vendorStoreId,
        vendorName: vendorStoreName || 'Ma Boutique',
        vendorRating: 5.0,
        vendorPhone: vendorPhone || '',
        vendorWhatsapp: vendorWhatsapp || '',
        inStock: true,
        createdAt: p.created_at || new Date().toISOString(),
      }));
      setStoreProducts(mapped);
    } else {
      setStoreProducts([]);
    }
    setProductsLoading(false);
  }, [vendorStoreId, vendorStoreName, vendorPhone, vendorWhatsapp]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Always use Supabase-fetched products — no dummy fallback
  const displayProducts = storeProducts;

  const handleDelete = (productId: string, productName: string) => {
    deleteVendorProduct(productId);
    setDeleteConfirmId(null);
    toast({ title: 'Produit supprimé', description: `${productName} a été retiré de votre boutique` });
  };

  const handleToggleStock = (productId: string, productName: string, inStock: boolean) => {
    toggleProductStock(productId);
    toast({
      title: inStock ? 'Produit hors stock' : 'Produit en stock',
      description: `${productName} est maintenant ${inStock ? 'indisponible' : 'disponible'}`,
    });
  };

  const handleViewProduct = (product: typeof vendorProducts[0]) => {
    selectProduct(product);
    setMode('client');
  };

  const handleSwitchToClient = () => {
    setMode('client');
  };

  return (
    <div className="pb-24">
      {/* ── Store Header (Gradient) ──────────────────────────────── */}
      <div className="mx-4 mt-4 mb-5 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-36 h-36 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 border border-white/30">
            {vendorStoreName ? vendorStoreName.charAt(0).toUpperCase() : 'W'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold leading-tight">
              {vendorStoreName || 'Ma Boutique'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
              <span className="text-xs text-white/80">Boutique active</span>
            </div>
            {vendorPhone && (
              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3 h-3 text-white/70" />
                <span className="text-xs text-white/70 font-mono">{vendorPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://wa.me/${(vendorWhatsapp || vendorPhone || '2250700000000').replace(/\s/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-50 rounded-xl p-3.5 hover:bg-green-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-green-800 block">Contacter le support</span>
              <span className="text-[10px] text-green-600">WhatsApp</span>
            </div>
          </a>
          <button
            onClick={handleSwitchToClient}
            className="flex items-center gap-3 bg-orange-50 rounded-xl p-3.5 hover:bg-orange-100 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-orange-800 block">Mode Client</span>
              <span className="text-[10px] text-orange-600">Voir la boutique</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Mes Produits Section ─────────────────────────────────── */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Mes Produits
            <span className="text-xs font-normal text-gray-400 ml-1.5">
              {displayProducts.length} article{displayProducts.length > 1 ? 's' : ''}
            </span>
          </h3>
          <button
            onClick={fetchProducts}
            className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {productsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
            <p className="text-xs text-gray-400">Chargement des produits…</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {displayProducts.map((product) => {
              const catInfo = CATEGORIES.find((c) => c.id === product.category);
              const isDeleting = deleteConfirmId === product.id;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    isDeleting ? 'border-red-200 shadow-md' : 'border-gray-100 shadow-sm'
                  } ${!product.inStock ? 'opacity-60' : ''}`}
                >
                  {/* Delete Confirmation Overlay */}
                  {isDeleting && (
                    <div className="bg-red-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-red-700">Supprimer ?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="px-2 py-1 rounded-md bg-red-500 text-white text-[9px] font-bold"
                        >
                          Oui
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-600 text-[9px] font-bold"
                        >
                          Non
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Stock toggle */}
                    <button
                      onClick={() => handleToggleStock(product.id, product.name, product.inStock)}
                      className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
                    >
                      {product.inStock ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteConfirmId(isDeleting ? null : product.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
                    >
                      {isDeleting ? (
                        <X className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </button>
                    {/* Price badge */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 pt-6">
                      <span className="text-xs font-bold text-white">{formatPrice(product.price)}</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        {catInfo?.icon} {catInfo?.name || product.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !vendorStoreId ? (
          <div className="bg-amber-50 rounded-2xl py-10 text-center border border-amber-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Store className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-amber-800">Boutique non synchronisée</p>
            <p className="text-xs text-amber-600 mt-1">Votre boutique n'est pas encore connectée au serveur.</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl py-10 text-center">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm font-medium text-gray-500">Aucun produit</p>
            <p className="text-xs text-gray-400 mt-0.5">Ajoutez votre premier produit depuis le bouton ➕</p>
          </div>
        )}
      </div>

      {/* ── Switch to Client Mode (bottom) ──────────────────────── */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleSwitchToClient}
          variant="outline"
          className="w-full h-12 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-semibold text-sm"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Basculer en Mode Client
        </Button>
      </div>

      {/* Version tag */}
      <p className="text-center text-[10px] text-gray-300 mt-6">
        WABUZ v1.0 · Abidjan
      </p>
    </div>
  );
}
