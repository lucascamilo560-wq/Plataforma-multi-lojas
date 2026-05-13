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
  productType: 'physical' | 'service' | 'external_link' | 'affiliate'
  externalUrl?: string
  ctaLabel?: string
  sponsoredLabel?: string
  affiliateDisclaimer?: string
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'delivered' | 'cancelled'

export type PaymentStatus = 'awaiting_payment' | 'to_be_arranged' | 'paid' | 'failed' | 'refunded'

export type OrderPaymentMethod =
  | 'pix'
  | 'cash'
  | 'card_on_delivery'
  | 'pickup_payment'
  | 'external_payment_link'
  | 'whatsapp'
  | 'custom'

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
  paymentMethodKey?: OrderPaymentMethod
  items?: OrderItem[]
  subtotal?: number
  deliveryFee?: number
  couponCode?: string
  discountTotal?: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paidAt?: string
  paymentInstructions?: string
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
