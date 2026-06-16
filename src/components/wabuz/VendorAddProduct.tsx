'use client';

import { useAppStore } from '@/lib/store';
import { CATEGORIES, formatPrice } from '@/lib/data';
import { useState } from 'react';
import { Camera, Link2, X, CheckCircle2, ArrowLeft, Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Default store ID for the demo — matches the row created in Supabase
const DEFAULT_STORE_ID = 'a1b2c3d4-1234-5678-9101-e11213141516';

// Suggested images per category
const SUGGESTED_IMAGES: Record<string, string[]> = {
  smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop',
  ],
  mode: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
  ],
  beaute: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
  ],
  maison: [
    'https://images.unsplash.com/photo-1631567091168-90e2e4ddc1b4?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop',
  ],
  electronique: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631567091168-90e2e4ddc1b4?w=600&h=600&fit=crop',
  ],
  sport: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&h=600&fit=crop',
  ],
  alimentation: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop',
  ],
  enfants: [
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=600&fit=crop',
  ],
};

export function VendorAddProduct() {
  const { addVendorProduct, setView, vendorStoreName, vendorPhone, vendorWhatsapp } = useAppStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProductName, setCreatedProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSuggestedImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !category || !description) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    // Resolve category display name (Supabase stores labels like "Smartphones", not IDs like "smartphones")
    const categoryName =
      CATEGORIES.find((c) => c.id === category)?.name ?? category;

    // Use the first uploaded image, fallback to a neutral placeholder
    const primaryImage =
      images[0] ??
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';

    const priceNum = parseInt(price, 10);

    // ── Insert into Supabase ────────────────────────────────────
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: name,
          description: description,
          price: priceNum,
          image_url: primaryImage,
          category: categoryName,
          store_id: DEFAULT_STORE_ID, // Demo store — on associe le produit à la boutique factice
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      toast({
        title: "Erreur lors de l'ajout du produit",
        description: error.message,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    // ── Success — also push into local store for instant feedback ──
    const insertedRow = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const product = {
      id: insertedRow?.id ? String(insertedRow.id) : `p_new_${Date.now()}`,
      name,
      price: priceNum,
      category,
      description,
      images: images.length > 0 ? images : [primaryImage],
      vendorId: 'v_current',
      vendorName: vendorStoreName || 'Ma Boutique',
      vendorRating: 5.0,
      vendorPhone: vendorPhone || '+225 07 00 00 00',
      vendorWhatsapp: vendorWhatsapp || '225070000000',
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    addVendorProduct(product);
    setCreatedProductName(name);
    setShowSuccess(true);
    setSubmitting(false);

    toast({
      title: 'Produit ajouté avec succès dans la base de données !',
      description: `${name} est maintenant visible sur WABUZ`,
    });
  };

  // Success State
  if (showSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Produit publié !</h2>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold text-gray-700">{createdProductName}</span> est maintenant visible par les clients
        </p>
        <p className="text-xs text-gray-400 mb-8">Les acheteurs à Abidjan peuvent dès à présent le commander</p>

        <div className="w-full space-y-3">
          <Button
            onClick={() => {
              setShowSuccess(false);
              setName('');
              setPrice('');
              setCategory('');
              setDescription('');
              setImages([]);
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
          >
            Ajouter un autre produit
          </Button>
          <Button
            onClick={() => setView('vendor-products')}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold"
          >
            Voir mes produits
          </Button>
          <Button
            onClick={() => setView('vendor-dashboard')}
            variant="ghost"
            className="w-full h-10 text-gray-400 text-sm"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const priceNum = parseInt(price, 10) || 0;
  const suggestedImages = category ? SUGGESTED_IMAGES[category] || [] : [];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Nouveau produit</h2>
        <span className="text-xs text-gray-400">Remplissez les informations ci-dessous</span>
      </div>

      <div className="px-4 space-y-5">
        {/* Photos */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Photos du produit
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 transition-colors cursor-pointer">
              <ImagePlus className="w-5 h-5 text-gray-300" />
              <span className="text-[9px] text-gray-400 mt-1">Ajouter</span>
            </label>
          </div>

          {/* Image URL Input */}
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Collez l'URL d'une image"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
            />
            <Button
              onClick={handleAddImage}
              variant="outline"
              size="sm"
              className="h-10 px-4 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Link2 className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {/* Suggested Images */}
          {suggestedImages.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5">Images suggérées :</p>
              <div className="flex gap-2">
                {suggestedImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedImage(url)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      images.includes(url) ? 'border-orange-500 opacity-50' : 'border-transparent hover:border-orange-300'
                    }`}
                  >
                    <img src={url} alt="Suggestion" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Name */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Nom du produit <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Samsung Galaxy A54 128Go"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Prix (FCFA) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="185000"
              className="w-full h-12 px-4 pr-16 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
              FCFA
            </span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Catégorie <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.id ? '' : cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  category === cat.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre produit : état, caractéristiques, conditions de livraison..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
          />
          <p className="text-[11px] text-gray-400 mt-1">{description.length}/500 caractères</p>
        </div>
      </div>

      {/* Live Preview */}
      {name && priceNum > 0 && (
        <div className="px-4 mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Aperçu</p>
          <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
              {images[0] ? (
                <img src={images[0]} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {category ? CATEGORIES.find((c) => c.id === category)?.icon : '📦'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{name}</p>
              <p className="text-base font-bold text-orange-600 mt-0.5">{formatPrice(priceNum)}</p>
              {category && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  {CATEGORIES.find((c) => c.id === category)?.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!name || !price || !category || !description || submitting}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publication en cours…
            </>
          ) : (
            'Publier le produit'
          )}
        </Button>
        <p className="text-[11px] text-gray-400 text-center mt-2">
          Votre produit sera visible immédiatement sur WABUZ
        </p>
      </div>
    </div>
  );
}
