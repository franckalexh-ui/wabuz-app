'use client';

import { PRODUCTS, CATEGORIES, formatPrice } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { ProductCard } from './ProductCard';
import { SearchBar } from './SearchBar';
import { CategoryBar } from './CategoryBar';
import { TrendingUp, Clock, Sparkles } from 'lucide-react';

export function ClientHome() {
  const { searchQuery, selectedCategory } = useAppStore();

  // Filter products
  let filteredProducts = PRODUCTS;
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.vendorName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
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
                <span className="text-sm text-gray-400">
                  ({filteredProducts.length})
                </span>
              </>
            ) : searchQuery ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  Résultats pour &quot;{searchQuery}&quot;
                </span>
                <span className="text-sm text-gray-400">
                  ({filteredProducts.length})
                </span>
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
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="px-4 grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Aucun produit trouvé
          </h3>
          <p className="text-sm text-gray-400">
            Essayez de modifier votre recherche ou catégorie
          </p>
        </div>
      )}

      {/* Recently Viewed Section (only on home without filters) */}
      {!selectedCategory && !searchQuery && (
        <div className="mt-8">
          <div className="px-4 flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-base font-bold text-gray-900">Récemment Consultés</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4" style={{ minWidth: 'max-content' }}>
              {PRODUCTS.slice(0, 6).map((product) => (
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
