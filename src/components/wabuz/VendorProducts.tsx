'use client';

import { PRODUCTS, formatPrice, CATEGORIES } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Plus, Edit3, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VendorProducts() {
  const { setView } = useAppStore();

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mes Produits</h2>
          <span className="text-xs text-gray-400">{PRODUCTS.length} articles en ligne</span>
        </div>
        <Button
          onClick={() => setView('vendor-add-product')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Products List */}
      <div className="px-4 space-y-3">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 shadow-sm"
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
              <p className="text-base font-bold text-orange-600 mt-0.5">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
                </span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  En stock
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Edit3 className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Eye className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
