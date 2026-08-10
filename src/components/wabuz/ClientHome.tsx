'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CATEGORIES, formatPrice, type Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { ProductCard } from './ProductCard';
import { SearchBar } from './SearchBar';
import { CategoryBar } from './CategoryBar';
import { TrendingUp, Clock, Sparkles, Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';

// ── Helper: normalize a Supabase row to local Product shape ────────
function normalizeRow(row: any): Product {
  return {
    id: String(row.id),
    name: row.name ?? 'Sans nom',
    price: Number(row.price ?? 0),
    category: row.category ?? '',
    description: row.description ?? '',
    images: Array.isArray(row.images)
      ? row.images
      : row.image_url
        ? [row.image_url]
        : [],
    vendorId: String(row.store_id ?? row.vendor_id ?? row.vendorId ?? ''),
    vendorName: row.vendor_name ?? row.store_name ?? row.vendorName ?? 'Boutique WABUZ',
    vendorRating: Number(row.vendor_rating ?? row.vendorRating ?? 0),
    vendorPhone: row.vendor_phone ?? row.vendorPhone ?? '',
    vendorWhatsapp: row.vendor_whatsapp ?? row.vendorWhatsapp ?? '',
    inStock: row.in_stock ?? row.inStock ?? true,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

export function ClientHome() {
  const { searchQuery, selectedCategory } = useAppStore();

  // ── Products state ──────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // cached full list for local fallback
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch all products from Supabase (initial load) ────────
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      setError(fetchError.message);
      setAllProducts([]);
      setProducts([]);
    } else if (data) {
      const normalized = (data as any[]).map(normalizeRow);
      setAllProducts(normalized);
      setProducts(normalized);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // ── Real-time Supabase search (search-as-you-type) ─────────
  const handleSearch = useCallback(async (query: string) => {
    // Empty query → show all products
    if (!query || query.trim().length === 0) {
      setProducts(allProducts);
      setSearchLoading(false);
      return;
    }

    const trimmed = query.trim();

    if (isSupabaseConfigured) {
      setSearchLoading(true);
      const { data, error: searchError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%,category.ilike.%${trimmed}%`);

      if (searchError) {
        console.error('Search error:', searchError.message);
        // Fallback to local filtering on error
        const q = trimmed.toLowerCase();
        const localFiltered = allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.vendorName.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
        setProducts(localFiltered);
      } else if (data) {
        const normalized = (data as any[]).map(normalizeRow);
        setProducts(normalized);
      }
      setSearchLoading(false);
    } else {
      // Local fallback when Supabase is not configured
      const q = trimmed.toLowerCase();
      const localFiltered = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
      setProducts(localFiltered);
    }
  }, [allProducts]);

  // ── Debounced search trigger on searchQuery change ─────────
  useEffect(() => {
    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery || searchQuery.trim().length === 0) {
      // No search — restore all products immediately
      setProducts(allProducts);
      setSearchLoading(false);
      return;
    }

    // Show loading indicator immediately
    setSearchLoading(true);

    // Debounce: wait 300ms after last keystroke before hitting Supabase
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, handleSearch, allProducts]);

  // ── Filter products by category (applied locally on top of search results) ──
  let filteredProducts = products;
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory);
  }

  const selectedCategoryName = selectedCategory
    ? CATEGORIES.find((c) => c.id === selectedCategory)?.name
    : null;

  return (
    <div className="pb-4">
      {/* Search Bar */}
      <SearchBar />

      {/* Categories */}
      <CategoryBar />

      {/* Promo Banner */}
      {!selectedCategory && !searchQuery && (
        <div className="px-4 py-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-white/90" />
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                  Offre Spéciale
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Livraison Gratuite<br />ce Weekend !
              </h2>
              <p className="text-sm text-white/80 mt-1.5">
                Sur toutes les commandes à Cocody & Plateau
              </p>
              <button className="mt-3 bg-white text-orange-600 font-semibold text-sm px-5 py-2 rounded-full hover:bg-orange-50 transition-colors">
                Commander Maintenant
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
          </div>
        </div>
      )}

      {/* Section Title */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedCategoryName ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {selectedCategoryName}
                </span>
                {!loading && !searchLoading && (
                  <span className="text-sm text-gray-400">
                    ({filteredProducts.length})
                  </span>
                )}
              </>
            ) : searchQuery ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  Résultats pour &quot;{searchQuery}&quot;
                </span>
                {!loading && !searchLoading && (
                  <span className="text-sm text-gray-400">
                    ({filteredProducts.length})
                  </span>
                )}
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-bold text-gray-900">
                  Tendances à Abidjan
                </span>
              </>
            )}
          </div>
          {/* Search loading spinner */}
          {searchLoading && !loading && (
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Chargement des produits…
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Connexion à Supabase en cours
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Impossible de charger les produits
          </p>
          <p className="text-xs text-gray-500 mb-4 max-w-xs">
            {error}
          </p>
          <button
            onClick={fetchAllProducts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="px-4 grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-16 text-center">
              {searchQuery ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    Aucun produit trouvé pour &quot;{searchQuery}&quot;
                  </h3>
                  <p className="text-sm text-gray-400">
                    Essayez avec un autre mot-clé ou catégorie
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-sm text-gray-400">
                    Essayez de modifier votre recherche ou catégorie
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Recently Viewed Section (only on home without filters) */}
      {!selectedCategory && !searchQuery && !loading && !error && allProducts.length > 0 && (
        <div className="mt-8">
          <div className="px-4 flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-base font-bold text-gray-900">Récemment Consultés</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4" style={{ minWidth: 'max-content' }}>
              {allProducts.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  onClick={() => useAppStore.getState().selectProduct(product)}
                  className="flex-shrink-0 w-32"
                >
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 mt-1.5 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-xs font-bold text-orange-500">
                    {formatPrice(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
