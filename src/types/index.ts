export type UserRole = 'customer' | 'store_admin' | 'super_admin'

export type OrderTimelineEntryType = 'status' | 'payment' | 'note'

export interface OrderTimelineEntry {
  id: string
  type: OrderTimelineEntryType
  label: string
  description?: string
  createdAt: string
}

export type StoreBusinessDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface StoreBusinessHours {
  day: StoreBusinessDay
  enabled: boolean
  openTime: string
  closeTime: string
}

export type StoreButtonStyle = 'rounded' | 'pill' | 'square'
export type StoreCardStyle = 'elevated' | 'flat' | 'outlined' | 'glass'
export type StoreProductLayout = 'grid-2' | 'list' | 'cards-wide'
export type StoreNavigationStyle = 'chips' | 'simple' | 'highlighted'
export type StoreHeroStyle = 'cover' | 'minimal' | 'centered'

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
  adminStatus?: 'active' | 'paused' | 'blocked'
  planId?: string
  // Theme & visual customization
  slogan?: string
  shortDescription?: string
  themePreset?: string
  buttonStyle?: StoreButtonStyle
  cardStyle?: StoreCardStyle
  productLayout?: StoreProductLayout
  navigationStyle?: StoreNavigationStyle
  heroStyle?: StoreHeroStyle
  showHero?: boolean
  showLoyaltyBlock?: boolean
  showPromotionsSection?: boolean
  showBestSellersSection?: boolean
  showWhatsappFloat?: boolean
  // Business hours & smart status
  businessHours?: StoreBusinessHours[]
  acceptOrdersWhenClosed?: boolean
  vacationMode?: boolean
  vacationMessage?: string
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
  deliveryType?: 'delivery' | 'pickup' | 'arrange'
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
  externalPaymentUrl?: string
  pixKey?: string
  pickupAddress?: string
  estimatedMinutes?: number
  createdAt: string
  orderPlacedWhileClosed?: boolean
  timeline?: OrderTimelineEntry[]
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
  pausedStores: number
  blockedStores: number
  totalOrders: number
  gmv: number
  confirmedRevenue: number
  pendingRevenue: number
  platformEstimatedRevenue: number
  activeSubscriptions: number
  estimatedCommissions: number
}

export interface PlatformPlan {
  id: string
  name: string
  monthlyPrice: number
  commissionRate: number
  commissionBase: 'paid_orders' | 'all_orders'
  productLimit: number | null
  features: string[]
  isActive: boolean
}

export interface StoreReview {
  id: string
  storeId: string
  orderId: string
  customerName: string
  customerPhone?: string
  rating: number
  comment?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}
