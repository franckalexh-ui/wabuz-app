'use client';

import { useAppStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/data';
import { useState } from 'react';
import { Camera, Link, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function VendorAddProduct() {
  const { addVendorProduct, setView } = useAppStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !price || !category || !description) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const product = {
      id: `p_new_${Date.now()}`,
      name,
      price: parseInt(price, 10),
      category,
      description,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
      vendorId: 'v_current',
      vendorName: 'Ma Boutique',
      vendorRating: 5.0,
      vendorPhone: '+225 07 00 00 00',
      vendorWhatsapp: '225070000000',
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    addVendorProduct(product);
    toast({
      title: 'Produit ajouté !',
      description: `${name} est maintenant en ligne`,
    });
    setView('vendor-products');
  };

  return (
    <div className="pb-6">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-gray-900">Ajouter un produit</h2>
        <span className="text-xs text-gray-400">Remplissez les informations du produit</span>
      </div>

      <div className="px-4 space-y-5">
        {/* Images */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Photos du produit
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {}} // Would open image picker in real app
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
            >
              <Camera className="w-5 h-5 text-gray-300" />
              <span className="text-[9px] text-gray-400 mt-1">Ajouter</span>
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de l'image"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
            />
            <Button
              onClick={handleAddImage}
              variant="outline"
              size="sm"
              className="h-10 px-4 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Link className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
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
                onClick={() => setCategory(cat.id)}
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
            placeholder="Décrivez votre produit en détail..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!name || !price || !category || !description}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50 transition-all"
        >
          Publier le produit
        </Button>
      </div>
    </div>
  );
}
