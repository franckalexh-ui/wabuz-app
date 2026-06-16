'use client';

import { Product, formatPrice } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectProduct } = useAppStore();
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Generate a gradient background as fallback
  const gradients = [
    'from-orange-200 to-amber-100',
    'from-pink-200 to-rose-100',
    'from-emerald-200 to-teal-100',
    'from-violet-200 to-purple-100',
    'from-cyan-200 to-sky-100',
  ];
  const gradientIndex = product.id.charCodeAt(product.id.length - 1) % gradients.length;

  return (
    <div
      onClick={() => selectProduct(product)}
      className="w-full text-left group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectProduct(product); } }}
    >
      <div className="relative rounded-xl overflow-hidden bg-gray-50 aspect-square">
        {/* Image */}
        {!imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}>
            <span className="text-4xl opacity-60">
              {product.category === 'smartphones' ? '📱' :
               product.category === 'mode' ? '👗' :
               product.category === 'beaute' ? '💄' :
               product.category === 'maison' ? '🏠' :
               product.category === 'electronique' ? '🔌' :
               product.category === 'sport' ? '⚽' :
               product.category === 'alimentation' ? '🍽️' : '🧸'}
            </span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md">
          <span className="text-xs font-bold text-orange-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-500 font-medium">
              {product.vendorRating}
            </span>
          </div>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400 truncate">
            {product.vendorName}
          </span>
        </div>
      </div>
    </div>
  );
}
