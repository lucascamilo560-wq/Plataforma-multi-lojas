export type UserRole = 'customer' | 'store_admin' | 'super_admin'

export interface Store {
  id: string
  name: string
  slug: string
  category: string
  description: string
  isActive: boolean
  rating: number
  city: string
  logoUrl?: string
  coverUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  whatsapp?: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl: string
  isActive: boolean
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'delivered' | 'cancelled'

export interface OrderItem {
  product_id: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  store_id: string
  customerName: string
  customerPhone?: string
  address?: string
  notes?: string
  deliveryType?: 'delivery' | 'pickup'
  paymentMethod?: string
  items?: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}

export interface CartItem {
  id: string
  store_id: string
  product_id: string
  productName: string
  quantity: number
  price: number
}

export interface AdminSummary {
  totalStores: number
  activeStores: number
  totalOrders: number
  grossRevenue: number
}
