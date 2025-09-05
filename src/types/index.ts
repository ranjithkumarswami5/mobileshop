export interface User {
  id: string;
  email: string;
  mobileNumber: string;
  referralCode: string;
  referredBy?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: 'phone' | 'accessory';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiryDate?: string;
  usageCount: number;
}

export interface Order {
  id: string;
  customerName: string;
  userId: string;
  total: number;
  appliedCoupon?: string;
  items: CartItem[];
  createdAt: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface ServiceOrder {
  id: string;
  customerName: string;
  contactNumber: string;
  deviceModel: string;
  serialNumber: string;
  issueDescription: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (email: string, password: string, mobileNumber: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}
