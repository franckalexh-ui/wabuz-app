'use client';

import { useAppStore } from '@/lib/store';
import { formatPrice, CATEGORIES } from '@/lib/data';
import { Plus, Edit3, Trash2, Eye, EyeOff, CheckCircle2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function VendorProducts() {
  const { vendorProducts, setView, deleteVendorProduct, toggleProductStock, selectProduct, setMode } = useAppStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = searchQuery
    ? vendorProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vendorProducts;

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

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mes Produits</h2>
            <span className="text-xs text-gray-400">{vendorProducts.length} article{vendorProducts.length > 1 ? 's' : ''} en ligne</span>
          </div>
          <Button
            onClick={() => setView('vendor-add-product')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="px-4 space-y-2.5">
        {filteredProducts.map((product) => {
          const catInfo = CATEGORIES.find((c) => c.id === product.category);
          const isDeleting = deleteConfirmId === product.id;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                isDeleting ? 'border-red-200 shadow-md shadow-red-50' : 'border-gray-100 shadow-sm'
              } ${!product.inStock ? 'opacity-60' : ''}`}
            >
              {/* Delete Confirmation */}
              {isDeleting && (
                <div className="bg-red-50 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-700">Supprimer ce produit ?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-[10px] font-bold hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3.5 flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-base font-bold text-orange-600 mt-0.5">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {catInfo?.icon} {catInfo?.name || product.category}
                    </span>
                    {product.inStock ? (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        En stock
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-medium">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        Hors stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleViewProduct(product)}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Voir sur la boutique"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleToggleStock(product.id, product.name, product.inStock)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    title={product.inStock ? 'Mettre hors stock' : 'Remettre en stock'}
                  >
                    {product.inStock ? (
                      <div className="bg-amber-50 hover:bg-amber-100 w-8 h-8 rounded-lg flex items-center justify-center">
                        <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                    ) : (
                      <div className="bg-emerald-50 hover:bg-emerald-100 w-8 h-8 rounded-lg flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(isDeleting ? null : product.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                    title="Supprimer"
                  >
                    {isDeleting ? <X className="w-3.5 h-3.5 text-red-500" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{searchQuery ? '🔍' : '📦'}</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              {searchQuery ? 'Aucun résultat' : 'Aucun produit'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {searchQuery ? 'Essayez un autre terme de recherche' : 'Ajoutez votre premier produit pour commencer'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setView('vendor-add-product')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un produit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
