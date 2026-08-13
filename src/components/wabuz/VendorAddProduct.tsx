'use client';

import { useAppStore } from '@/lib/store';
import { CATEGORIES, formatPrice } from '@/lib/data';
import { useState, useRef } from 'react';
import { Camera, X, CheckCircle2, Sparkles, ImagePlus, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

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
  const { addVendorProduct, setView, vendorStoreName, vendorPhone, vendorWhatsapp, vendorStoreId } = useAppStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProductName, setCreatedProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── File upload refs ──────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected files pending upload (for preview before submit)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSuggestedImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  // ── File selection handler ────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setPendingFiles((prev) => [...prev, ...newFiles]);
    setPendingPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePendingFile = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Upload image to Supabase Storage ──────────────────
  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  };

  // ── Submit handler ────────────────────────────────────
  const handleSubmit = async () => {
    if (!name || !price || !category || !description) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    // Require at least one image (uploaded file or URL)
    if (images.length === 0 && pendingFiles.length === 0) {
      toast({
        title: 'Photo requise',
        description: 'Ajoutez au moins une photo du produit',
        variant: 'destructive',
      });
      return;
    }

    // Require a valid store_id — vendor must create a store first
    if (!vendorStoreId) {
      toast({
        title: 'Boutique requise',
        description: 'Veuillez d\'abord créer votre boutique avant d\'ajouter un produit',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    setUploadingImage(pendingFiles.length > 0);

    // Upload pending files to Supabase Storage
    const uploadedUrls: string[] = [];
    for (const file of pendingFiles) {
      const publicUrl = await uploadImageToStorage(file);
      if (publicUrl) {
        uploadedUrls.push(publicUrl);
      } else {
        toast({
          title: "Erreur d'upload",
          description: `Impossible de télécharger "${file.name}". Réessayez.`,
          variant: 'destructive',
        });
      }
    }

    setUploadingImage(false);

    // Merge: existing URL images + newly uploaded images
    const allImages = [...images, ...uploadedUrls];

    const categoryName = CATEGORIES.find((c) => c.id === category)?.name ?? category;
    const primaryImage = allImages[0] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
    const priceNum = parseInt(price, 10);

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name, description, price: priceNum, image_url: primaryImage,
        category: categoryName, store_id: vendorStoreId,
      }])
      .select();

    if (error) {
      toast({ title: "Erreur lors de l'ajout", description: error.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    const insertedRow = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const product = {
      id: insertedRow?.id ? String(insertedRow.id) : `p_new_${Date.now()}`,
      name, price: priceNum, category, description,
      images: allImages.length > 0 ? allImages : [primaryImage],
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
    toast({ title: 'Produit ajouté avec succès !', description: `${name} est maintenant visible sur WABUZ` });
  };

  // Success State
  if (showSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Produit publié !</h2>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold text-gray-700">{createdProductName}</span> est maintenant visible
        </p>
        <p className="text-xs text-gray-400 mb-8">Les acheteurs à Abidjan peuvent le commander</p>

        <div className="w-full space-y-3">
          <Button
            onClick={() => {
              // Revoke any remaining blob URLs to free memory
              pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
              setShowSuccess(false); setName(''); setPrice('');
              setCategory(''); setDescription(''); setImages([]);
              setPendingFiles([]); setPendingPreviews([]);
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30"
          >
            Ajouter un autre produit
          </Button>
          <Button
            onClick={() => setView('vendor-store')}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold"
          >
            Voir ma boutique
          </Button>
        </div>
      </div>
    );
  }

  const priceNum = parseInt(price, 10) || 0;
  const suggestedImages = category ? SUGGESTED_IMAGES[category] || [] : [];
  const totalImageCount = images.length + pendingPreviews.length;
  const primaryPreview = images[0] || pendingPreviews[0];

  return (
    <div className="pb-4">
      {/* ── Live Preview Card (at top, updates instantly) ──────── */}
      {(name || priceNum > 0 || totalImageCount > 0) && (
        <div className="px-4 pt-4 mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Aperçu en direct</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-3 flex gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
              {primaryPreview ? (
                <img src={primaryPreview} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-100 to-gray-50">
                  {category ? CATEGORIES.find((c) => c.id === category)?.icon : '📦'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                {name || 'Nom du produit'}
              </p>
              <p className="text-base font-bold text-orange-600 mt-0.5">
                {priceNum > 0 ? formatPrice(priceNum) : '— FCFA'}
              </p>
              {category && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                  {CATEGORIES.find((c) => c.id === category)?.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Nouveau produit</h2>
        <span className="text-xs text-gray-400">Remplissez les informations ci-dessous</span>
      </div>

      {/* ── No store_id warning ──────────────────────────────── */}
      {!vendorStoreId && (
        <div className="mx-4 mt-2 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-sm font-semibold text-amber-800">Boutique non synchronisée</p>
          <p className="text-xs text-amber-600 mt-0.5">Vous devez d'abord créer votre boutique pour ajouter des produits.</p>
        </div>
      )}

      <div className="px-4 space-y-5">
        {/* ── Photo Upload Zone ────────────────────────────────── */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Photos du produit <span className="text-red-400">*</span>
          </label>

          {/* Hidden file input — accept="image/*" triggers native Camera/Gallery on mobile */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* When NO images yet: show large prominent upload zone */}
          {totalImageCount === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="w-full py-10 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50/40 active:scale-[0.98] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Camera className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-base font-semibold text-gray-700">Ajouter une photo</span>
              <span className="text-xs text-gray-400">Prendre une photo ou choisir de la galerie</span>
            </button>
          ) : (
            <>
              {/* Image thumbnails: uploaded URLs + pending local previews */}
              <div className="flex gap-2 flex-wrap mb-2">
                {/* Existing URL images */}
                {images.map((img, i) => (
                  <div key={`url-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}

                {/* Pending file previews (local blob URLs) */}
                {pendingPreviews.map((preview, i) => (
                  <div key={`pending-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group ring-2 ring-orange-300 ring-offset-1">
                    <img src={preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-orange-500/80 text-[8px] text-white font-bold text-center py-0.5">
                      Nouveau
                    </div>
                    <button
                      onClick={() => handleRemovePendingFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}

                {/* Add More Photos — smaller button when images exist */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 active:scale-95 transition-all"
                >
                  <ImagePlus className="w-5 h-5 text-gray-300" />
                  <span className="text-[9px] text-gray-400 mt-0.5">Ajouter</span>
                </button>
              </div>
            </>
          )}

          {/* Upload instruction */}
          <p className="text-[11px] text-gray-400 mt-1">
            {totalImageCount === 0
              ? 'Appuyez pour prendre une photo ou choisir depuis la galerie'
              : `${totalImageCount} photo(s) sélectionnée(s) — appuyez sur + pour en ajouter`
            }
          </p>

          {/* Suggested Images (quick picks based on category) */}
          {suggestedImages.length > 0 && (
            <div className="mt-3">
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

        {/* Product Name - large rounded input */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Nom du produit <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Samsung Galaxy A54 128Go"
            className="w-full h-14 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Price - large rounded input */}
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
              className="w-full h-14 px-4 pr-16 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
              FCFA
            </span>
          </div>
        </div>

        {/* Category - pill selection */}
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

        {/* Description - large rounded textarea */}
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

      {/* Submit Button */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!vendorStoreId || !name || !price || !category || !description || (images.length === 0 && pendingFiles.length === 0) || submitting}
          className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploadingImage ? "Téléchargement de l'image…" : 'Publication en cours…'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Publier le produit
            </>
          )}
        </Button>
        <p className="text-[11px] text-gray-400 text-center mt-2">
          {pendingFiles.length > 0
            ? `${pendingFiles.length} image(s) seront téléchargées automatiquement`
            : 'Votre produit sera visible immédiatement sur WABUZ'
          }
        </p>
      </div>
    </div>
  );
}
