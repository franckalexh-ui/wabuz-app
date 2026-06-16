import { create } from 'zustand';
import { Product, Order, DELIVERY_FEE } from './data';

export type AppMode = 'client' | 'vendor';
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

  // Vendor State
  vendorStoreName: string;
  vendorPhone: string;
  vendorWhatsapp: string;
  vendorProducts: Product[];
  vendorOrders: Order[];
  isStoreCreated: boolean;

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
  setVendorStore: (name: string, phone: string, whatsapp: string) => void;
  addVendorProduct: (product: Product) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setIsStoreCreated: (created: boolean) => void;
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
  vendorStoreName: '',
  vendorPhone: '',
  vendorWhatsapp: '',
  vendorProducts: [],
  vendorOrders: [],
  isStoreCreated: false,

  // Actions
  setMode: (mode) => set({ mode, view: mode === 'client' ? 'home' : 'vendor-dashboard' }),

  setView: (view) => set((state) => ({ view, previousView: state.view })),

  goBack: () => set((state) => {
    const prev = state.previousView;
    if (prev) {
      return { view: prev, previousView: null };
    }
    // Default navigation
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

  clearCart: () => set({ cart: [] }),

  setDeliveryZone: (zone) => set({ deliveryZone: zone }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setPaymentStatus: (status) => set({ paymentStatus: status }),

  setVendorStore: (name, phone, whatsapp) =>
    set({ vendorStoreName: name, vendorPhone: phone, vendorWhatsapp: whatsapp, isStoreCreated: true }),

  addVendorProduct: (product) =>
    set((state) => ({ vendorProducts: [...state.vendorProducts, product] })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      vendorOrders: state.vendorOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  setIsStoreCreated: (created) => set({ isStoreCreated: created }),

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
