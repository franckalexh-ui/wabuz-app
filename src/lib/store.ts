import { create } from 'zustand';
import { Product, Order, DELIVERY_FEE, MOCK_ORDERS, PRODUCTS } from './data';

export type AppMode = 'client' | 'vendor';
export type EscrowStatus = 'idle' | 'collecting' | 'held' | 'releasing' | 'released';

export type AppView =
  | 'home'
  | 'product-detail'
  | 'checkout'
  | 'payment-processing'
  | 'payment-success'
  | 'vendor-dashboard'
  | 'vendor-products'
  | 'vendor-orders'
  | 'vendor-add-product'
  | 'vendor-store-setup';

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  // Mode & Navigation
  mode: AppMode;
  view: AppView;
  previousView: AppView | null;

  // Client State
  selectedProduct: Product | null;
  searchQuery: string;
  selectedCategory: string | null;
  cart: CartItem[];
  deliveryZone: string;
  paymentMethod: 'wave' | 'orange_money';
  paymentStatus: 'idle' | 'processing' | 'success';
  escrowStatus: EscrowStatus;
  lastOrderId: string | null;

  // Vendor State
  vendorStoreName: string;
  vendorPhone: string;
  vendorWhatsapp: string;
  vendorProducts: Product[];
  vendorOrders: Order[];
  isStoreCreated: boolean;
  newOrderCount: number; // unread orders count
  vendorRevenue: number;

  // Actions
  setMode: (mode: AppMode) => void;
  setView: (view: AppView) => void;
  goBack: () => void;
  selectProduct: (product: Product) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setDeliveryZone: (zone: string) => void;
  setPaymentMethod: (method: 'wave' | 'orange_money') => void;
  setPaymentStatus: (status: 'idle' | 'processing' | 'success') => void;
  setEscrowStatus: (status: EscrowStatus) => void;
  setLastOrderId: (id: string | null) => void;
  resetCheckout: () => void;
  setVendorStore: (name: string, phone: string, whatsapp: string) => void;
  addVendorProduct: (product: Product) => void;
  deleteVendorProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setIsStoreCreated: (created: boolean) => void;
  clearNewOrderCount: () => void;
  simulateNewOrder: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  mode: 'client',
  view: 'home',
  previousView: null,
  selectedProduct: null,
  searchQuery: '',
  selectedCategory: null,
  cart: [],
  deliveryZone: '',
  paymentMethod: 'wave',
  paymentStatus: 'idle',
  escrowStatus: 'idle',
  lastOrderId: null,
  vendorStoreName: '',
  vendorPhone: '',
  vendorWhatsapp: '',
  vendorProducts: [...PRODUCTS.slice(0, 5)], // Vendor starts with 5 products
  vendorOrders: [...MOCK_ORDERS],
  isStoreCreated: false,
  newOrderCount: 1,
  vendorRevenue: 0,

  // Actions
  setMode: (mode) => set({ mode, view: mode === 'client' ? 'home' : 'vendor-dashboard' }),

  setView: (view) => set((state) => ({ view, previousView: state.view })),

  goBack: () => set((state) => {
    const prev = state.previousView;
    if (prev) {
      return { view: prev, previousView: null };
    }
    if (state.mode === 'client') {
      return { view: 'home', previousView: null };
    }
    return { view: 'vendor-dashboard', previousView: null };
  }),

  selectProduct: (product) => set({ selectedProduct: product, view: 'product-detail', previousView: 'home' }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  addToCart: (product, quantity = 1) => set((state) => {
    const existing = state.cart.find((item) => item.product.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      };
    }
    return { cart: [...state.cart, { product, quantity }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.product.id !== productId),
  })),

  clearCart: () => set({ cart: [], paymentStatus: 'idle', escrowStatus: 'idle', lastOrderId: null }),

  setDeliveryZone: (zone) => set({ deliveryZone: zone }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setPaymentStatus: (status) => set({ paymentStatus: status }),

  setEscrowStatus: (status) => set({ escrowStatus: status }),

  setLastOrderId: (id) => set({ lastOrderId: id }),

  resetCheckout: () => set({ paymentStatus: 'idle', escrowStatus: 'idle', lastOrderId: null }),

  setVendorStore: (name, phone, whatsapp) =>
    set({ vendorStoreName: name, vendorPhone: phone, vendorWhatsapp: whatsapp, isStoreCreated: true }),

  addVendorProduct: (product) =>
    set((state) => ({ vendorProducts: [product, ...state.vendorProducts] })),

  deleteVendorProduct: (productId) =>
    set((state) => ({
      vendorProducts: state.vendorProducts.filter((p) => p.id !== productId),
    })),

  toggleProductStock: (productId) =>
    set((state) => ({
      vendorProducts: state.vendorProducts.map((p) =>
        p.id === productId ? { ...p, inStock: !p.inStock } : p
      ),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      vendorOrders: state.vendorOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  setIsStoreCreated: (created) => set({ isStoreCreated: created }),

  clearNewOrderCount: () => set({ newOrderCount: 0 }),

  simulateNewOrder: () => {
    const { vendorProducts } = get();
    if (vendorProducts.length === 0) return;
    const randomProduct = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
    const zones = ['Cocody', 'Plateau', 'Adjamé', 'Yopougon', 'Marcory'] as const;
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      productId: randomProduct.id,
      productName: randomProduct.name,
      productImage: randomProduct.images[0],
      buyerPhone: `+225 0${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
      vendorId: 'v_current',
      vendorName: get().vendorStoreName || 'Ma Boutique',
      quantity: qty,
      totalPrice: randomProduct.price * qty + DELIVERY_FEE,
      deliveryZone: randomZone,
      deliveryFee: DELIVERY_FEE,
      status: 'pending',
      paymentMethod: Math.random() > 0.5 ? 'wave' : 'orange_money',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      vendorOrders: [newOrder, ...state.vendorOrders],
      newOrderCount: state.newOrderCount + 1,
    }));
  },

  getCartTotal: () => {
    const { cart } = get();
    const itemsTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return cart.length > 0 ? itemsTotal + DELIVERY_FEE : 0;
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
