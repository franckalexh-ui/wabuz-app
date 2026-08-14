// WABUZ Mock Data for MVP

export interface Product {
  id: string;
  name: string;
  price: number; // in FCFA
  oldPrice?: number | null; // previous price before markdown (Facebook-style strikethrough)
  category: string;
  description: string;
  images: string[];
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorPhone: string;
  vendorWhatsapp: string;
  inStock: boolean;
  stockQuantity: number; // stock count from Supabase, 0 = out of stock
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  rating: number;
  totalSales: number;
  avatar: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerPhone: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  totalPrice: number;
  deliveryZone: string;
  deliveryFee: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'wave' | 'orange_money';
  createdAt: string;
}

export interface ClientOrder {
  id: string;
  productName: string;
  productImage: string;
  vendorName: string;
  vendorPhone: string;
  deliveryZone: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed';
  escrowStatus: 'held' | 'released';
  // Optional extension fields (not required by the simple ClientOrders component)
  paymentMethod?: 'wave' | 'orange_money';
  quantity?: number;
  createdAt?: string;
  deliveredAt?: string;
  // UUID of the matching row in Supabase `orders` table (when the order was
  // persisted). Used to update Supabase on confirm-receipt.
  supabaseId?: string;
}

export const DELIVERY_ZONES = [
  'Cocody',
  'Plateau',
  'Adjamé',
  'Yopougon',
  'Marcory',
  'Treichville',
  'Abobo',
  'Koumassi',
] as const;

export const DELIVERY_FEE = 1500; // FCFA

export const CATEGORIES: Category[] = [
  { id: 'smartphones', name: 'Smartphones', icon: '📱', count: 24 },
  { id: 'mode', name: 'Mode', icon: '👗', count: 45 },
  { id: 'beaute', name: 'Beauté', icon: '💄', count: 32 },
  { id: 'maison', name: 'Maison', icon: '🏠', count: 18 },
  { id: 'electronique', name: 'Électronique', icon: '🔌', count: 21 },
  { id: 'sport', name: 'Sport', icon: '⚽', count: 15 },
  { id: 'alimentation', name: 'Alimentation', icon: '🍽️', count: 28 },
  { id: 'enfants', name: 'Enfants', icon: '🧸', count: 19 },
];

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'TechShop CI',
    phone: '+225 07 58 42 10',
    whatsapp: '22507584210',
    rating: 4.8,
    totalSales: 342,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=ff6b00',
    createdAt: '2024-01-15',
  },
  {
    id: 'v2',
    name: 'Afrique Mode',
    phone: '+225 05 44 89 22',
    whatsapp: '22505448922',
    rating: 4.6,
    totalSales: 189,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AM&backgroundColor=00b140',
    createdAt: '2024-03-22',
  },
  {
    id: 'v3',
    name: 'Beauté Royale',
    phone: '+225 01 23 67 45',
    whatsapp: '22501236745',
    rating: 4.9,
    totalSales: 456,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=e91e63',
    createdAt: '2024-02-10',
  },
  {
    id: 'v4',
    name: 'MaisonPlus',
    phone: '+225 07 11 55 88',
    whatsapp: '22507115588',
    rating: 4.3,
    totalSales: 98,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MP&backgroundColor=9c27b0',
    createdAt: '2024-05-08',
  },
  {
    id: 'v5',
    name: 'SportZone Abidjan',
    phone: '+225 05 99 33 77',
    whatsapp: '22505993377',
    rating: 4.5,
    totalSales: 210,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SZ&backgroundColor=2196f3',
    createdAt: '2024-04-15',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Samsung Galaxy A54 128Go',
    price: 185000,
    category: 'smartphones',
    description: 'Samsung Galaxy A54 5G avec 128Go de stockage, 6Go RAM. Écran Super AMOLED 6.4 pouces, appareil photo 50MP. Batterie 5000mAh. Garantie 1 an. Livraison possible partout à Abidjan.',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop',
    ],
    vendorId: 'v1',
    vendorName: 'TechShop CI',
    vendorRating: 4.8,
    vendorPhone: '+225 07 58 42 10',
    vendorWhatsapp: '22507584210',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-01',
  },
  {
    id: 'p2',
    name: 'iPhone 13 128Go',
    price: 350000,
    category: 'smartphones',
    description: 'iPhone 13 128Go en excellent état. Batterie à 92%. Aucune rayure sur l\'écran. Vendu avec chargeur et coque. Possibilité de tester avant achat à Cocody.',
    images: [
      'https://images.unsplash.com/photo-1632633143588-514e0ad7d726?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
    ],
    vendorId: 'v1',
    vendorName: 'TechShop CI',
    vendorRating: 4.8,
    vendorPhone: '+225 07 58 42 10',
    vendorWhatsapp: '22507584210',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-05',
  },
  {
    id: 'p3',
    name: 'Robe Wax Africaine Premium',
    price: 25000,
    category: 'mode',
    description: 'Magnifique robe en wax authentique, confectionnée à Abidjan. Taille M/L. Motifs traditionnels ivoiriens avec finitions soignées. Parfaite pour les cérémonies et sorties.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=600&h=600&fit=crop',
    ],
    vendorId: 'v2',
    vendorName: 'Afrique Mode',
    vendorRating: 4.6,
    vendorPhone: '+225 05 44 89 22',
    vendorWhatsapp: '22505448922',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-10-28',
  },
  {
    id: 'p4',
    name: 'Ensemble Pagne Homme',
    price: 35000,
    category: 'mode',
    description: 'Ensemble pagne complet pour homme : chemise + pantalon. Tissu de qualité supérieure, couture artisanale. Plusieurs coloris disponibles. Livraison à Abidjan.',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    ],
    vendorId: 'v2',
    vendorName: 'Afrique Mode',
    vendorRating: 4.6,
    vendorPhone: '+225 05 44 89 22',
    vendorWhatsapp: '22505448922',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-02',
  },
  {
    id: 'p5',
    name: 'Crème Hydratante Karité',
    price: 5000,
    category: 'beaute',
    description: 'Crème hydratante au beurre de karité 100% naturel. Fabriquée en Côte d\'Ivoire. Nourrit et protège la peau. Idéale pour peaux sèches. Pot de 250ml.',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
    ],
    vendorId: 'v3',
    vendorName: 'Beauté Royale',
    vendorRating: 4.9,
    vendorPhone: '+225 01 23 67 45',
    vendorWhatsapp: '22501236745',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-03',
  },
  {
    id: 'p6',
    name: 'Kit Maquillage Complet',
    price: 18000,
    category: 'beaute',
    description: 'Kit maquillage professionnel : fond de teint, poudre, mascara, rouge à lèvres x3, pinceaux. Marque locale de qualité. Tons adaptés aux peaux métissées et noires.',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=600&h=600&fit=crop',
    ],
    vendorId: 'v3',
    vendorName: 'Beauté Royale',
    vendorRating: 4.9,
    vendorPhone: '+225 01 23 67 45',
    vendorWhatsapp: '22501236745',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-01',
  },
  {
    id: 'p7',
    name: 'Smart TV 43 Pouces 4K',
    price: 145000,
    category: 'electronique',
    description: 'Smart TV 43 pouces Ultra HD 4K. Android TV intégré avec Netflix, YouTube. Connectivité WiFi et Bluetooth. 2 ports HDMI, 2 ports USB. Garantie 2 ans.',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop',
    ],
    vendorId: 'v4',
    vendorName: 'MaisonPlus',
    vendorRating: 4.3,
    vendorPhone: '+225 07 11 55 88',
    vendorWhatsapp: '22507115588',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-10-25',
  },
  {
    id: 'p8',
    name: 'Climatiseur 12000 BTU',
    price: 195000,
    category: 'maison',
    description: 'Climatiseur split 12000 BTU, faible consommation énergétique. Installation incluse dans la zone d\'Abidjan. Télécommande et filtre anti-bactérien. Marque fiable.',
    images: [
      'https://images.unsplash.com/photo-1631567091168-90e2e4ddc1b4?w=600&h=600&fit=crop',
    ],
    vendorId: 'v4',
    vendorName: 'MaisonPlus',
    vendorRating: 4.3,
    vendorPhone: '+225 07 11 55 88',
    vendorWhatsapp: '22507115588',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-10-20',
  },
  {
    id: 'p9',
    name: 'Paire de Chaussures Nike',
    price: 45000,
    category: 'sport',
    description: 'Nike Air Max 90, pointure 42. Authentique, achetée en boutique. Très bon état, peu portée. Blanche avec accents noirs. Livraison possible à Abidjan.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    ],
    vendorId: 'v5',
    vendorName: 'SportZone Abidjan',
    vendorRating: 4.5,
    vendorPhone: '+225 05 99 33 77',
    vendorWhatsapp: '22505993377',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-04',
  },
  {
    id: 'p10',
    name: 'Ballon Football Official',
    price: 8000,
    category: 'sport',
    description: 'Ballon de football officiel, taille 5. Cuire synthétique de haute qualité. Poids réglementaire. Idéal pour matchs et entraînements. Plusieurs coloris disponibles.',
    images: [
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&h=600&fit=crop',
    ],
    vendorId: 'v5',
    vendorName: 'SportZone Abidjan',
    vendorRating: 4.5,
    vendorPhone: '+225 05 99 33 77',
    vendorWhatsapp: '22505993377',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-06',
  },
  {
    id: 'p11',
    name: 'Sac à Main Cuir Véritable',
    price: 28000,
    category: 'mode',
    description: 'Sac à main en cuir véritable fait main. Design élégant et moderne. Plusieurs compartiments. Couleur marron. Parfait pour le bureau et les sorties.',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    ],
    vendorId: 'v2',
    vendorName: 'Afrique Mode',
    vendorRating: 4.6,
    vendorPhone: '+225 05 44 89 22',
    vendorWhatsapp: '22505448922',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-07',
  },
  {
    id: 'p12',
    name: 'Tecno Spark 20 Pro',
    price: 95000,
    category: 'smartphones',
    description: 'Tecno Spark 20 Pro, 128Go stockage, 8Go RAM. Double SIM 4G. Appareil photo 108MP. Batterie 5000mAh avec charge rapide. Neuf sous blister.',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
    ],
    vendorId: 'v1',
    vendorName: 'TechShop CI',
    vendorRating: 4.8,
    vendorPhone: '+225 07 58 42 10',
    vendorWhatsapp: '22507584210',
    inStock: true,
    stockQuantity: 10,
    createdAt: '2024-11-08',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    productId: 'p1',
    productName: 'Samsung Galaxy A54 128Go',
    productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop',
    buyerPhone: '+225 07 12 34 56',
    vendorId: 'v1',
    vendorName: 'TechShop CI',
    quantity: 1,
    totalPrice: 186500,
    deliveryZone: 'Cocody',
    deliveryFee: 1500,
    status: 'paid',
    paymentMethod: 'wave',
    createdAt: '2024-11-08T10:30:00',
  },
  {
    id: 'ord2',
    productId: 'p5',
    productName: 'Crème Hydratante Karité',
    productImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=200&fit=crop',
    buyerPhone: '+225 05 98 76 54',
    vendorId: 'v3',
    vendorName: 'Beauté Royale',
    quantity: 2,
    totalPrice: 11500,
    deliveryZone: 'Plateau',
    deliveryFee: 1500,
    status: 'shipped',
    paymentMethod: 'orange_money',
    createdAt: '2024-11-07T14:15:00',
  },
  {
    id: 'ord3',
    productId: 'p3',
    productName: 'Robe Wax Africaine Premium',
    productImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    buyerPhone: '+225 01 55 44 33',
    vendorId: 'v2',
    vendorName: 'Afrique Mode',
    quantity: 1,
    totalPrice: 26500,
    deliveryZone: 'Yopougon',
    deliveryFee: 1500,
    status: 'delivered',
    paymentMethod: 'wave',
    createdAt: '2024-11-05T09:00:00',
  },
  {
    id: 'ord4',
    productId: 'p9',
    productName: 'Paire de Chaussures Nike',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
    buyerPhone: '+225 07 66 77 88',
    vendorId: 'v5',
    vendorName: 'SportZone Abidjan',
    quantity: 1,
    totalPrice: 46500,
    deliveryZone: 'Marcory',
    deliveryFee: 1500,
    status: 'pending',
    paymentMethod: 'wave',
    createdAt: '2024-11-08T16:45:00',
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

// Mock client orders — what the buyer sees in "Mes Commandes"
export const MOCK_CLIENT_ORDERS: ClientOrder[] = [
  {
    id: 'cmd_001',
    productName: 'iPhone 13 Pro 128Go',
    productImage: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500',
    vendorName: 'TechStore CI',
    vendorPhone: '2250707070707',
    deliveryZone: 'Cocody',
    totalAmount: 451500, // 450000 + 1500 livraison
    status: 'shipped', // L'utilisateur peut confirmer la réception
    escrowStatus: 'held',
  },
  {
    id: 'cmd_002',
    productName: 'Robe Wax Moderne',
    // Note: the URL in the spec (photo-1583394293214-28a5b87e1f4d) returns 404 on Unsplash,
    // using a working wax dress photo instead
    productImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
    vendorName: 'Awa Fashion',
    vendorPhone: '2250708080808',
    deliveryZone: 'Marcory',
    totalAmount: 16500, // 15000 + 1500 livraison
    status: 'delivered', // Déjà livré
    escrowStatus: 'released',
  },
];
