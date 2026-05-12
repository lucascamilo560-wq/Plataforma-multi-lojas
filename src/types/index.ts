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
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'delivered'

export interface Order {
  id: string
  store_id: string
  customerName: string
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
