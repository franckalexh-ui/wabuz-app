'use client';

import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, Lock, Unlock, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const formatFCFA = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;

export default function ClientOrders() {
  const clientOrders = useAppStore((state) => state.clientOrders) || [];
  const confirmReceipt = useAppStore((state) => state.confirmReceipt) || (() => {});

  const [activeTab, setActiveTab] = useState<'active' | 'delivered'>('active');

  const activeOrders = clientOrders.filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'shipped');
  const deliveredOrders = clientOrders.filter(o => o.status === 'delivered');

  const handleConfirm = (orderId: string) => {
    if (window.confirm('Confirmez-vous avoir reçu votre colis en bon état ? Les fonds seront libérés au vendeur.')) {
      confirmReceipt(orderId);
    }
  };

  const openWhatsApp = (phone: string, storeName: string) => {
    const message = encodeURIComponent(`Bonjour ${storeName}, je vous contacte concernant ma commande sur WABUZ.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const OrderCard = ({ order }: { order: any }) => {
    const isShipped = order.status === 'shipped';
    const isDelivered = order.status === 'delivered';
    const isEscrowHeld = order.escrowStatus === 'held';

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
          <div>
            <p className="text-xs text-gray-500 font-medium">Commande #{order.id.toUpperCase()}</p>
            <p className="text-sm font-bold text-gray-900">{order.vendorName}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isDelivered ? 'bg-emerald-100 text-emerald-700' :
            isShipped ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {isDelivered ? 'Livré' : isShipped ? 'En livraison' : 'En attente'}
          </div>
        </div>

        <div className="flex gap-4 p-4">
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-20 h-20 rounded-xl object-cover bg-gray-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{order.productName}</h3>
            <p className="text-xs text-gray-500 mt-1">Livraison: {order.deliveryZone}</p>
            <div className="flex items-center gap-2 mt-2">
              {isEscrowHeld ? (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Lock size={12} /> Escrow bloqué
                </span>
              ) : isDelivered && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <Unlock size={12} /> Escrow libéré
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">{formatFCFA(order.totalAmount)}</p>
            <p className="text-xs text-gray-400 mt-1">(Total payé)</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className={`flex flex-col items-center ${order.status !== 'pending' ? 'text-emerald-600' : ''}`}>
              <CheckCircle2 size={16} className={order.status !== 'pending' ? 'fill-emerald-100' : ''} />
              <span className="mt-1">Payé</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${isShipped || isDelivered ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${isShipped || isDelivered ? 'text-emerald-600' : ''}`}>
              <Truck size={16} />
              <span className="mt-1">Expédié</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${isDelivered ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${isDelivered ? 'text-emerald-600' : ''}`}>
              <Package size={16} />
              <span className="mt-1">Livré</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={() => openWhatsApp(order.vendorPhone, order.vendorName)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={16} className="text-green-600" />
            Contacter
          </button>

          {isShipped && (
            <button
              onClick={() => handleConfirm(order.id)}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <CheckCircle2 size={16} />
              Confirmer la réception
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-extrabold text-gray-900 text-center">Mes Commandes</h1>

          <div className="flex mt-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              En cours ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'delivered' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Terminées ({deliveredOrders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'active' ? (
          activeOrders.length > 0 ? (
            activeOrders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucune commande en cours</p>
              <p className="text-gray-400 text-sm mt-1">Vos achats apparaîtront ici</p>
            </div>
          )
        ) : (
          deliveredOrders.length > 0 ? (
            deliveredOrders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-20">
              <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucune commande terminée</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
