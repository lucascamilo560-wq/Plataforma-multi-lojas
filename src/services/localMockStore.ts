import type {
  AdminSummary,
  CartItem,
  Order,
  OrderItem,
  OrderPaymentMethod,
  OrderStatus,
  OrderTimelineEntry,
  PaymentStatus,
  PlatformPlan,
  Product,
  Store,
} from '../types'

export interface Coupon {
  id: string
  store_id: string
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minOrderValue?: number
  usageLimit?: number
  usedCount: number
  startsAt?: string
  expiresAt?: string
  active: boolean
  description?: string
}

export interface Promotion {
  id: string
  store_id: string
  title: string
  description: string
  active: boolean
  startsAt?: string
  expiresAt?: string
  highlightColor?: string
  productIds?: string[]
  bannerText?: string
}

export interface PaymentMethod {
  id: string
  store_id: string
  name: string
  type: OrderPaymentMethod
  enabled: boolean
  pixKey?: string
  instructions?: string
  externalUrl?: string
}

export interface DeliverySettings {
  store_id: string
  deliveryEnabled: boolean
  pickupEnabled: boolean
  combineDelivery: boolean
  estimatedMinutes: number
  fee: number
  minOrder: number
  neighborhoods: string
  pickupAddress: string
  deliveryNotes: string
}

/**
 * Controla se as lojas de demonstração (Mercado Central, Casa do Café, Moda Urbana)
 * são exibidas automaticamente para clientes comuns.
 *
 * false = fluxo real (cliente só vê lojas via link/convite do lojista)
 * true  = modo demo/dev (lojas fake carregadas automaticamente)
 */
export const ENABLE_DEMO_STORES = false

const STORAGE_KEYS = {
  // Dados compartilhados (lojas, produtos, pedidos…)
  stores: 'marketplace:stores',
  products: 'marketplace:products',
  orders: 'marketplace:orders',
  coupons: 'marketplace:coupons',
  promotions: 'marketplace:promotions',
  paymentMethods: 'marketplace:payment-methods',
  deliverySettings: 'marketplace:delivery-settings',
  plans: 'marketplace:plans',

  // Dados do cliente (separados do estado do lojista)
  cartItems: 'marketplace:customer:cart',
  followedStores: 'marketplace:customer:followed-stores',
  lastVisitedStoreSlug: 'marketplace:customer:last-visited-slug',
  invitedStoreSlug: 'marketplace:customer:invited-slug',
  activeStoreSlug: 'marketplace:customer:active-slug',

  // Dados do lojista
  sellerStoreId: 'marketplace:seller:store-id',

  // CRM do lojista
  customerRelationships: 'marketplace:crm:relationships',
} as const

const defaultStores: Store[] = [
  {
    id: 'store-1',
    name: 'Mercado Central',
    slug: 'mercado-central',
    category: 'Supermercado',
    description: 'Itens de mercado, mercearia e hortifruti.',
    isActive: true,
    rating: 4.8,
    city: 'São Paulo',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=160',
    coverUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
    primaryColor: '#14213D',
    secondaryColor: '#E8EEF9',
    accentColor: '#3A86FF',
    whatsapp: '5511999990001',
    adminStatus: 'active',
    planId: 'basic',
  },
  {
    id: 'store-2',
    name: 'Casa do Café',
    slug: 'casa-do-cafe',
    category: 'Bebidas',
    description: 'Cafés especiais e acessórios para preparo.',
    isActive: true,
    rating: 4.7,
    city: 'Campinas',
    logoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=160',
    coverUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1200',
    primaryColor: '#4A2C2A',
    secondaryColor: '#F4ECE4',
    accentColor: '#FF7A59',
    whatsapp: '5519999990002',
    adminStatus: 'active',
    planId: 'premium',
  },
  {
    id: 'store-3',
    name: 'Moda Urbana',
    slug: 'moda-urbana',
    category: 'Moda',
    description: 'Roupas e acessórios para o dia a dia.',
    isActive: false,
    rating: 4.4,
    city: 'Rio de Janeiro',
    logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=160',
    coverUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
    primaryColor: '#1F2937',
    secondaryColor: '#EEF2FF',
    accentColor: '#6C63FF',
    adminStatus: 'paused',
    planId: 'free',
  },
]

const defaultPlans: PlatformPlan[] = [
  { id: 'free', name: 'Grátis', monthlyPrice: 0, commissionRate: 8, commissionBase: 'paid_orders', productLimit: 30, features: ['Vitrine básica', 'Pedidos no app'], isActive: true },
  { id: 'basic', name: 'Básico', monthlyPrice: 49.9, commissionRate: 5, commissionBase: 'paid_orders', productLimit: 200, features: ['Cupons', 'Promoções', 'Relatórios básicos'], isActive: true },
  { id: 'premium', name: 'Premium', monthlyPrice: 129.9, commissionRate: 3, commissionBase: 'all_orders', productLimit: null, features: ['Marca personalizada', 'Relatórios avançados'], isActive: true },
  { id: 'white-label', name: 'White Label', monthlyPrice: 299.9, commissionRate: 1.5, commissionBase: 'all_orders', productLimit: null, features: ['App com identidade da marca', 'Suporte prioritário'], isActive: true },
]

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    store_id: 'store-1',
    name: 'Cesta de frutas',
    description: 'Seleção de frutas da estação.',
    price: 29.9,
    stock: 26,
    category: 'Hortifruti',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
    isActive: true,
    productType: 'physical',
    ctaLabel: 'Adicionar ao carrinho',
  },
  {
    id: 'prod-2',
    store_id: 'store-2',
    name: 'Kit barista',
    description: 'Grãos + moedor manual + filtro.',
    price: 119.9,
    stock: 12,
    category: 'Café',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    isActive: true,
    productType: 'physical',
    ctaLabel: 'Adicionar ao carrinho',
  },
  {
    id: 'prod-3',
    store_id: 'store-1',
    name: 'Queijo artesanal',
    description: 'Produção local com maturação de 30 dias.',
    price: 42,
    stock: 8,
    category: 'Laticínios',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600',
    isActive: true,
    productType: 'physical',
    ctaLabel: 'Adicionar ao carrinho',
  },
]

const defaultOrders: Order[] = [
  {
    id: 'ord-1',
    store_id: 'store-1',
    customerName: 'Ana Souza',
    total: 89.8,
    status: 'preparing',
    paymentStatus: 'awaiting_payment',
    paymentMethod: 'Pix',
    paymentMethodKey: 'pix',
    createdAt: '2026-05-11T10:35:00.000Z',
  },
  {
    id: 'ord-2',
    store_id: 'store-1',
    customerName: 'Carlos Lima',
    total: 42,
    status: 'pending',
    paymentStatus: 'to_be_arranged',
    paymentMethod: 'Combinar pelo WhatsApp',
    paymentMethodKey: 'whatsapp',
    createdAt: '2026-05-11T09:10:00.000Z',
  },
  {
    id: 'ord-3',
    store_id: 'store-2',
    customerName: 'Marina Alves',
    total: 119.9,
    status: 'paid',
    paymentStatus: 'paid',
    paymentMethod: 'Pix',
    paymentMethodKey: 'pix',
    paidAt: '2026-05-10T18:30:00.000Z',
    createdAt: '2026-05-10T18:22:00.000Z',
  },
]

const defaultCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    store_id: 'store-1',
    code: 'BEMVINDO10',
    discountType: 'percent',
    discountValue: 10,
    usedCount: 0,
    active: true,
    description: 'Desconto de boas-vindas de 10%',
  },
]

const defaultPromotions: Promotion[] = [
  {
    id: 'promo-1',
    store_id: 'store-1',
    title: 'Semana de hortifruti',
    description: 'Seleção com desconto para itens frescos.',
    bannerText: '🥦 Hortifruti fresquinho com desconto especial!',
    active: true,
  },
]

const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'pm-1', store_id: 'store-1', name: 'Pix', type: 'pix', enabled: true },
  { id: 'pm-2', store_id: 'store-1', name: 'Cartão na entrega', type: 'card_on_delivery', enabled: true },
  { id: 'pm-3', store_id: 'store-2', name: 'Pix', type: 'pix', enabled: true },
]

const defaultDeliverySettings: DeliverySettings[] = [
  {
    store_id: 'store-1',
    deliveryEnabled: true,
    pickupEnabled: true,
    combineDelivery: false,
    estimatedMinutes: 45,
    fee: 6,
    minOrder: 0,
    neighborhoods: '',
    pickupAddress: '',
    deliveryNotes: '',
  },
  {
    store_id: 'store-2',
    deliveryEnabled: true,
    pickupEnabled: false,
    combineDelivery: false,
    estimatedMinutes: 60,
    fee: 8,
    minOrder: 0,
    neighborhoods: '',
    pickupAddress: '',
    deliveryNotes: '',
  },
]

const defaultCartItems: CartItem[] = [
  {
    id: 'cart-1',
    store_id: 'store-1',
    product_id: 'prod-1',
    productName: 'Cesta de frutas',
    quantity: 1,
    price: 29.9,
  },
  {
    id: 'cart-2',
    store_id: 'store-1',
    product_id: 'prod-3',
    productName: 'Queijo artesanal',
    quantity: 2,
    price: 42,
  },
]

const validOrderStatus: OrderStatus[] = ['pending', 'paid', 'preparing', 'delivered', 'cancelled']
const validPaymentStatus: PaymentStatus[] = ['awaiting_payment', 'to_be_arranged', 'paid', 'failed', 'refunded']
const validProductTypes = ['physical', 'service', 'external_link', 'affiliate'] as const

function getDefaultCtaLabel(productType: Product['productType']) {
  switch (productType) {
    case 'service':
      return 'Solicitar'
    case 'external_link':
      return 'Ver oferta'
    case 'affiliate':
      return 'Ver oferta externa'
    case 'physical':
    default:
      return 'Adicionar ao carrinho'
  }
}

function normalizeOptionalString(value?: string) {
  return value?.trim() || undefined
}

function normalizeProduct(product: Product): Product {
  const productType: Product['productType'] = validProductTypes.includes(product.productType)
    ? product.productType
    : 'physical'
  const normalizedExternalUrl = normalizeOptionalString(product.externalUrl)
  const hasRequiredExternalUrl = productType === 'external_link' || productType === 'affiliate'

  if (hasRequiredExternalUrl && !normalizedExternalUrl) {
    throw new Error('Produtos por link externo precisam de uma URL externa.')
  }

  return {
    ...product,
    stock: Number.isFinite(product.stock) ? Math.max(0, product.stock) : 0,
    price: Number.isFinite(product.price) ? Math.max(0, product.price) : 0,
    isActive: product.isActive ?? true,
    productType,
    externalUrl: normalizedExternalUrl,
    ctaLabel: product.ctaLabel?.trim() ? product.ctaLabel.trim() : getDefaultCtaLabel(productType),
    sponsoredLabel: product.sponsoredLabel?.trim() ? product.sponsoredLabel.trim() : undefined,
    affiliateDisclaimer: product.affiliateDisclaimer?.trim() ? product.affiliateDisclaimer.trim() : undefined,
  }
}

function deepCopy<T>(value: T): T {
  return structuredClone(value)
}

function readCollection<T>(key: string, fallback: T[], normalize: (value: T[]) => T[] = (value) => value): T[] {
  const rawValue = window.localStorage.getItem(key)

  if (!rawValue) {
    const nextValue = normalize(deepCopy(fallback))
    window.localStorage.setItem(key, JSON.stringify(nextValue))
    return nextValue
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      throw new Error(`Esperado array na chave ${key}, recebido ${typeof parsedValue}`)
    }

    const nextValue = normalize(parsedValue as T[])
    window.localStorage.setItem(key, JSON.stringify(nextValue))
    return nextValue
  } catch {
    const nextValue = normalize(deepCopy(fallback))
    window.localStorage.setItem(key, JSON.stringify(nextValue))
    return nextValue
  }
}

function persistCollection<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct)
}

function normalizeOrders(orders: Order[]): Order[] {
  return orders.map((order) => ({
    ...order,
    status: validOrderStatus.includes(order.status) ? order.status : 'pending',
    paymentStatus: validPaymentStatus.includes(order.paymentStatus) ? order.paymentStatus : 'awaiting_payment',
  }))
}

function getStoresCollection() {
  return readCollection(STORAGE_KEYS.stores, defaultStores)
}

function setStoresCollection(stores: Store[]) {
  persistCollection(STORAGE_KEYS.stores, stores)
}

function getProductsCollection() {
  return readCollection(STORAGE_KEYS.products, defaultProducts, normalizeProducts)
}

function setProductsCollection(products: Product[]) {
  persistCollection(STORAGE_KEYS.products, normalizeProducts(products))
}

function getOrdersCollection() {
  return readCollection(STORAGE_KEYS.orders, defaultOrders, normalizeOrders)
}

function setOrdersCollection(orders: Order[]) {
  persistCollection(STORAGE_KEYS.orders, normalizeOrders(orders))
}

function getCouponsCollection() {
  return readCollection(STORAGE_KEYS.coupons, defaultCoupons)
}

function setCouponsCollection(coupons: Coupon[]) {
  persistCollection(STORAGE_KEYS.coupons, coupons)
}

function getPromotionsCollection() {
  return readCollection(STORAGE_KEYS.promotions, defaultPromotions)
}

function setPromotionsCollection(promotions: Promotion[]) {
  persistCollection(STORAGE_KEYS.promotions, promotions)
}

function getPaymentMethodsCollection() {
  return readCollection(STORAGE_KEYS.paymentMethods, defaultPaymentMethods)
}

function setPaymentMethodsCollection(paymentMethods: PaymentMethod[]) {
  persistCollection(STORAGE_KEYS.paymentMethods, paymentMethods)
}

function getDeliverySettingsCollection() {
  return readCollection(STORAGE_KEYS.deliverySettings, defaultDeliverySettings)
}
function getPlansCollection() {
  return readCollection(STORAGE_KEYS.plans, defaultPlans)
}
function setPlansCollection(plans: PlatformPlan[]) {
  persistCollection(STORAGE_KEYS.plans, plans)
}

function setDeliverySettingsCollection(deliverySettings: DeliverySettings[]) {
  persistCollection(STORAGE_KEYS.deliverySettings, deliverySettings)
}

function getCartItemsCollection() {
  return readCollection(STORAGE_KEYS.cartItems, defaultCartItems)
}

function setCartItemsCollection(items: CartItem[]) {
  persistCollection(STORAGE_KEYS.cartItems, items)
}

function getFollowedStoresCollection() {
  return readCollection<string>(STORAGE_KEYS.followedStores, []).filter(Boolean)
}

function setFollowedStoresCollection(storeIds: string[]) {
  const deduplicatedStoreIds = Array.from(new Set(storeIds.map((storeId) => storeId.trim()).filter(Boolean)))
  persistCollection(STORAGE_KEYS.followedStores, deduplicatedStoreIds)
}

function readStoredSlug(key: string) {
  const value = window.localStorage.getItem(key)?.trim()
  return value || null
}

function setStoredSlug(key: string, slug: string | null) {
  if (!slug) {
    window.localStorage.removeItem(key)
    return
  }

  const normalizedValue = slug.trim()
  if (!normalizedValue) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, normalizedValue)
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function getNextId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function makeTimelineEntry(
  type: OrderTimelineEntry['type'],
  label: string,
  description?: string,
  createdAt?: string,
): OrderTimelineEntry {
  return {
    id: getNextId('tl'),
    type,
    label,
    description,
    createdAt: createdAt ?? new Date().toISOString(),
  }
}

function appendTimelineEntry(order: Order, entry: OrderTimelineEntry): Order {
  const existing = order.timeline ?? []
  return { ...order, timeline: [...existing, entry] }
}

const statusTimelineLabel: Partial<Record<OrderStatus, { label: string; description?: string }>> = {
  paid: { label: 'Pedido confirmado', description: 'A loja confirmou o recebimento do pedido.' },
  preparing: { label: 'Pedido em preparo', description: 'A loja está preparando o pedido.' },
  delivered: { label: 'Pedido entregue', description: 'O pedido foi marcado como entregue.' },
  cancelled: { label: 'Pedido cancelado', description: 'O pedido foi cancelado.' },
}

const paymentTimelineLabel: Partial<Record<PaymentStatus, { label: string; description?: string }>> = {
  paid: { label: 'Pagamento confirmado', description: 'O pagamento foi confirmado pelo lojista.' },
  failed: { label: 'Pagamento falhou', description: 'O pagamento não foi concluído.' },
  refunded: { label: 'Pagamento estornado', description: 'O pagamento foi estornado.' },
  awaiting_payment: { label: 'Pagamento aguardando', description: 'Aguardando confirmação de pagamento.' },
  to_be_arranged: { label: 'Pagamento a combinar', description: 'Pagamento será combinado com o cliente.' },
}

export async function getStores(): Promise<Store[]> {
  return Promise.resolve(getStoresCollection())
}

export async function getStoreById(storeId: string): Promise<Store | undefined> {
  return Promise.resolve(getStoresCollection().find((store) => store.id === storeId))
}

export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  return Promise.resolve(getStoresCollection().find((store) => store.slug === slug))
}

export async function getProductsByStore(
  storeId: string,
  options?: { includeInactive?: boolean },
): Promise<Product[]> {
  const includeInactive = options?.includeInactive ?? false
  const products = getProductsCollection().filter((product) => product.store_id === storeId)

  return Promise.resolve(includeInactive ? products : products.filter((product) => product.isActive))
}

export async function getStoreOrders(storeId: string): Promise<Order[]> {
  return Promise.resolve(getOrdersCollection().filter((order) => order.store_id === storeId))
}

export async function getCartItems(): Promise<CartItem[]> {
  return Promise.resolve(getCartItemsCollection())
}

export async function followStore(storeId: string): Promise<void> {
  const normalizedStoreId = storeId.trim()

  if (!normalizedStoreId) {
    throw new Error('Informe uma loja válida para seguir.')
  }

  const followedStores = getFollowedStoresCollection()
  if (followedStores.includes(normalizedStoreId)) {
    return Promise.resolve()
  }

  setFollowedStoresCollection([...followedStores, normalizedStoreId])
  return Promise.resolve()
}

export async function unfollowStore(storeId: string): Promise<void> {
  const normalizedStoreId = storeId.trim()
  const followedStores = getFollowedStoresCollection()
  setFollowedStoresCollection(followedStores.filter((id) => id !== normalizedStoreId))
  return Promise.resolve()
}

export async function isStoreFollowed(storeId: string): Promise<boolean> {
  const normalizedStoreId = storeId.trim()
  return Promise.resolve(getFollowedStoresCollection().includes(normalizedStoreId))
}

export async function getFollowedStores(): Promise<string[]> {
  return Promise.resolve(getFollowedStoresCollection())
}

export async function registerStoreVisit(slug: string): Promise<void> {
  const normalizedSlug = slug.trim()
  if (!normalizedSlug) {
    throw new Error('Informe um slug de loja válido para registrar a visita.')
  }

  setStoredSlug(STORAGE_KEYS.lastVisitedStoreSlug, normalizedSlug)
  setStoredSlug(STORAGE_KEYS.invitedStoreSlug, normalizedSlug)
  setStoredSlug(STORAGE_KEYS.activeStoreSlug, normalizedSlug)
  return Promise.resolve()
}

export async function getLastVisitedStoreSlug(): Promise<string | null> {
  return Promise.resolve(readStoredSlug(STORAGE_KEYS.lastVisitedStoreSlug))
}

export async function getInvitedStoreSlug(): Promise<string | null> {
  return Promise.resolve(readStoredSlug(STORAGE_KEYS.invitedStoreSlug))
}

export async function setActiveStoreSlug(slug: string): Promise<void> {
  const normalizedSlug = slug.trim()
  if (!normalizedSlug) {
    throw new Error('Informe um slug de loja válido para ativar.')
  }

  setStoredSlug(STORAGE_KEYS.activeStoreSlug, normalizedSlug)
  return Promise.resolve()
}

export async function getActiveStoreSlug(): Promise<string | null> {
  return Promise.resolve(readStoredSlug(STORAGE_KEYS.activeStoreSlug))
}

export async function clearActiveStoreSlug(): Promise<void> {
  setStoredSlug(STORAGE_KEYS.activeStoreSlug, null)
  return Promise.resolve()
}

export async function getActiveStore(): Promise<Store | null> {
  const activeStoreSlug = readStoredSlug(STORAGE_KEYS.activeStoreSlug)
  if (!activeStoreSlug) {
    return Promise.resolve(null)
  }

  const activeStore = getStoresCollection().find((store) => store.slug === activeStoreSlug) ?? null
  return Promise.resolve(activeStore)
}

export async function addProductToCart(product: Product): Promise<void> {
  if (product.productType !== 'physical') {
    throw new Error('Somente produtos físicos podem ser adicionados ao carrinho.')
  }

  const items = getCartItemsCollection()
  const existingItemIndex = items.findIndex(
    (item) => item.product_id === product.id && item.store_id === product.store_id,
  )

  const nextItems =
    existingItemIndex >= 0
      ? items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [
          ...items,
          {
            id: getNextId('cart'),
            store_id: product.store_id,
            product_id: product.id,
            productName: product.name,
            quantity: 1,
            price: product.price,
          },
        ]

  setCartItemsCollection(nextItems)
  return Promise.resolve()
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const stores = getStoresCollection()
  const orders = getOrdersCollection()
  const plans = getPlansCollection()
  const planById = new Map(plans.map((plan) => [plan.id, plan]))
  const effectiveStatus = (store: Store) => store.adminStatus ?? (store.isActive ? 'active' : 'paused')
  const confirmedOrders = orders.filter((order) => order.paymentStatus === 'paid')
  const pendingOrders = orders.filter(
    (order) => order.status !== 'cancelled' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'failed' && order.paymentStatus !== 'refunded',
  )
  const estimatedCommissions = stores.reduce((sum, store) => {
    const storePlan = planById.get(store.planId ?? 'free')
    if (!storePlan) return sum
    const storeOrders = orders.filter((order) => order.store_id === store.id)
    const baseAmount = (storePlan.commissionBase === 'paid_orders' ? storeOrders.filter((order) => order.paymentStatus === 'paid') : storeOrders)
      .reduce((total, order) => total + order.total, 0)
    return sum + (baseAmount * storePlan.commissionRate) / 100
  }, 0)
  const monthlyRevenue = stores.reduce((sum, store) => sum + (planById.get(store.planId ?? 'free')?.monthlyPrice ?? 0), 0)

  return Promise.resolve({
    totalStores: stores.length,
    activeStores: stores.filter((store) => effectiveStatus(store) === 'active').length,
    pausedStores: stores.filter((store) => effectiveStatus(store) === 'paused').length,
    blockedStores: stores.filter((store) => effectiveStatus(store) === 'blocked').length,
    totalOrders: orders.length,
    gmv: orders.reduce((total, order) => total + order.total, 0),
    confirmedRevenue: confirmedOrders.reduce((total, order) => total + order.total, 0),
    pendingRevenue: pendingOrders.reduce((total, order) => total + order.total, 0),
    platformEstimatedRevenue: monthlyRevenue + estimatedCommissions,
    activeSubscriptions: stores.filter((store) => (planById.get(store.planId ?? 'free')?.monthlyPrice ?? 0) > 0).length,
    estimatedCommissions,
  })
}

export async function createProduct(
  payload: Omit<Product, 'id'> & { isActive?: boolean },
): Promise<Product> {
  const products = getProductsCollection()
  const product = normalizeProduct({
    ...payload,
    id: getNextId('prod'),
    isActive: payload.isActive ?? true,
  })

  setProductsCollection([...products, product])
  return Promise.resolve(product)
}

export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'store_id'>>,
): Promise<Product | undefined> {
  let updatedProduct: Product | undefined

  const products = getProductsCollection().map((product) => {
    if (product.id !== productId) {
      return product
    }

    updatedProduct = normalizeProduct({
      ...product,
      ...updates,
      stock: updates.stock ?? product.stock,
      price: updates.price ?? product.price,
      isActive: updates.isActive ?? product.isActive,
    })

    return updatedProduct
  })

  setProductsCollection(products)
  return Promise.resolve(updatedProduct)
}

export async function deleteProduct(productId: string): Promise<void> {
  const products = getProductsCollection().filter((product) => product.id !== productId)
  const cartItems = getCartItemsCollection().filter((item) => item.product_id !== productId)

  setProductsCollection(products)
  setCartItemsCollection(cartItems)

  return Promise.resolve()
}

export async function toggleProductActive(productId: string): Promise<Product | undefined> {
  const product = getProductsCollection().find((item) => item.id === productId)

  if (!product) {
    return Promise.resolve(undefined)
  }

  return updateProduct(productId, { isActive: !product.isActive })
}

export async function updateProductStock(productId: string, stock: number): Promise<Product | undefined> {
  return updateProduct(productId, { stock: Math.max(0, stock) })
}

export async function updateStoreProfile(
  storeId: string,
  updates: Partial<Pick<Store, 'name' | 'description' | 'category' | 'city' | 'logoUrl' | 'coverUrl' | 'isActive' | 'whatsapp' | 'primaryColor' | 'secondaryColor' | 'accentColor' | 'adminStatus' | 'planId' | 'slogan' | 'shortDescription' | 'themePreset' | 'buttonStyle' | 'cardStyle' | 'productLayout' | 'navigationStyle' | 'heroStyle' | 'showHero' | 'showLoyaltyBlock' | 'showPromotionsSection' | 'showBestSellersSection' | 'showWhatsappFloat' | 'businessHours' | 'acceptOrdersWhenClosed' | 'vacationMode' | 'vacationMessage'>>,
): Promise<Store | undefined> {
  let updatedStore: Store | undefined

  const stores = getStoresCollection().map((store) => {
    if (store.id !== storeId) {
      return store
    }

    updatedStore = {
      ...store,
      ...updates,
      slug: updates.name ? normalizeSlug(updates.name) : store.slug,
    }

    return updatedStore
  })

  setStoresCollection(stores)
  return Promise.resolve(updatedStore)
}

export async function updateStoreTheme(
  storeId: string,
  updates: Partial<Pick<Store, 'primaryColor' | 'secondaryColor' | 'accentColor' | 'logoUrl' | 'coverUrl' | 'slogan' | 'shortDescription' | 'themePreset' | 'buttonStyle' | 'cardStyle' | 'productLayout' | 'navigationStyle' | 'heroStyle' | 'showHero' | 'showLoyaltyBlock' | 'showPromotionsSection' | 'showBestSellersSection' | 'showWhatsappFloat'>>,
): Promise<Store | undefined> {
  return updateStoreProfile(storeId, updates)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | undefined> {
  let updatedOrder: Order | undefined

  const orders = getOrdersCollection().map((order) => {
    if (order.id !== orderId) {
      return order
    }

    if (order.status === status) {
      updatedOrder = order
      return order
    }

    const tlInfo = statusTimelineLabel[status]
    const entry = tlInfo ? makeTimelineEntry('status', tlInfo.label, tlInfo.description) : undefined
    const withStatus = { ...order, status }
    updatedOrder = entry ? appendTimelineEntry(withStatus, entry) : withStatus
    return updatedOrder
  })

  setOrdersCollection(orders)
  return Promise.resolve(updatedOrder)
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<Order | undefined> {
  let updatedOrder: Order | undefined
  const now = new Date().toISOString()

  const orders = getOrdersCollection().map((order) => {
    if (order.id !== orderId) {
      return order
    }

    if (order.paymentStatus === paymentStatus) {
      updatedOrder = order
      return order
    }

    const withPayment: Order = {
      ...order,
      paymentStatus,
      paidAt: paymentStatus === 'paid' ? (order.paidAt ?? now) : order.paidAt,
    }
    const tlInfo = paymentTimelineLabel[paymentStatus]
    const entry = tlInfo ? makeTimelineEntry('payment', tlInfo.label, tlInfo.description) : undefined
    updatedOrder = entry ? appendTimelineEntry(withPayment, entry) : withPayment
    return updatedOrder
  })

  setOrdersCollection(orders)
  return Promise.resolve(updatedOrder)
}

export async function createCoupon(payload: Omit<Coupon, 'id'>): Promise<Coupon> {
  const coupons = getCouponsCollection()
  const coupon: Coupon = {
    ...payload,
    id: getNextId('coupon'),
    usedCount: payload.usedCount ?? 0,
    code: payload.code.trim().toUpperCase(),
  }

  setCouponsCollection([...coupons, coupon])

  return Promise.resolve(coupon)
}

export async function updateCoupon(couponId: string, updates: Partial<Omit<Coupon, 'id' | 'store_id'>>): Promise<Coupon | undefined> {
  let updated: Coupon | undefined
  const coupons = getCouponsCollection().map((c) => {
    if (c.id !== couponId) return c
    updated = {
      ...c,
      ...updates,
      code: updates.code ? updates.code.trim().toUpperCase() : c.code,
    }
    return updated
  })
  setCouponsCollection(coupons)
  return Promise.resolve(updated)
}

export async function toggleCouponActive(couponId: string): Promise<Coupon | undefined> {
  const coupon = getCouponsCollection().find((c) => c.id === couponId)
  if (!coupon) return Promise.resolve(undefined)
  return updateCoupon(couponId, { active: !coupon.active })
}

export async function deleteCoupon(couponId: string): Promise<void> {
  setCouponsCollection(getCouponsCollection().filter((c) => c.id !== couponId))
  return Promise.resolve()
}

export type ValidateCouponResult =
  | {
      valid: true
      coupon: Coupon
      discountAmount: number
    }
  | {
      valid: false
      error: string
    }

export async function validateCoupon(storeId: string, code: string, subtotal: number): Promise<ValidateCouponResult> {
  const normalized = code.trim().toUpperCase()
  const coupon = getCouponsCollection().find(
    (c) => c.store_id === storeId && c.code === normalized,
  )

  if (!coupon) return Promise.resolve({ valid: false, error: 'Cupom não encontrado.' })
  if (!coupon.active) return Promise.resolve({ valid: false, error: 'Este cupom está inativo.' })

  const now = new Date().toISOString()
  if (coupon.startsAt && now < coupon.startsAt) {
    return Promise.resolve({ valid: false, error: 'Este cupom ainda não está válido.' })
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return Promise.resolve({ valid: false, error: 'Este cupom expirou.' })
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return Promise.resolve({ valid: false, error: 'Este cupom atingiu o limite de uso.' })
  }
  if (coupon.minOrderValue != null && subtotal < coupon.minOrderValue) {
    return Promise.resolve({
      valid: false,
      error: `Pedido mínimo de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(coupon.minOrderValue)} para este cupom.`,
    })
  }

  const discountAmount =
    coupon.discountType === 'percent'
      ? Math.round((subtotal * coupon.discountValue / 100) * 100) / 100
      : Math.min(coupon.discountValue, subtotal)

  return Promise.resolve({ valid: true, coupon, discountAmount })
}

export async function updatePaymentSettings(
  storeId: string,
  paymentMethods: Array<Omit<PaymentMethod, 'id' | 'store_id'>>,
): Promise<PaymentMethod[]> {
  const methodsWithoutStore = getPaymentMethodsCollection().filter((method) => method.store_id !== storeId)
  const nextMethods: PaymentMethod[] = paymentMethods.map((method) => ({
    ...method,
    id: getNextId('pm'),
    store_id: storeId,
  }))

  setPaymentMethodsCollection([...methodsWithoutStore, ...nextMethods])

  return Promise.resolve(nextMethods)
}

export async function updateDeliverySettings(
  storeId: string,
  settings: Omit<DeliverySettings, 'store_id'>,
): Promise<DeliverySettings> {
  const currentSettings = getDeliverySettingsCollection().filter((item) => item.store_id !== storeId)
  const nextSettings: DeliverySettings = {
    ...settings,
    store_id: storeId,
    estimatedMinutes: Math.max(0, settings.estimatedMinutes),
    fee: Math.max(0, settings.fee),
    minOrder: Math.max(0, settings.minOrder ?? 0),
    neighborhoods: settings.neighborhoods ?? '',
    pickupAddress: settings.pickupAddress ?? '',
    deliveryNotes: settings.deliveryNotes ?? '',
    combineDelivery: settings.combineDelivery ?? false,
  }

  setDeliverySettingsCollection([...currentSettings, nextSettings])

  return Promise.resolve(nextSettings)
}

export async function getCouponsByStore(storeId: string): Promise<Coupon[]> {
  return Promise.resolve(getCouponsCollection().filter((coupon) => coupon.store_id === storeId))
}

export async function getPromotionsByStore(storeId: string): Promise<Promotion[]> {
  return Promise.resolve(getPromotionsCollection().filter((promo) => promo.store_id === storeId))
}

export async function getActivePromotionsByStore(storeId: string): Promise<Promotion[]> {
  const now = new Date().toISOString()
  return Promise.resolve(
    getPromotionsCollection().filter((promo) => {
      if (promo.store_id !== storeId) return false
      if (!promo.active) return false
      if (promo.startsAt && now < promo.startsAt) return false
      if (promo.expiresAt && now > promo.expiresAt) return false
      return true
    }),
  )
}

export async function createPromotion(payload: Omit<Promotion, 'id'>): Promise<Promotion> {
  const promotions = getPromotionsCollection()
  const promotion: Promotion = { ...payload, id: getNextId('promo') }
  setPromotionsCollection([...promotions, promotion])
  return Promise.resolve(promotion)
}

export async function updatePromotion(promotionId: string, updates: Partial<Omit<Promotion, 'id' | 'store_id'>>): Promise<Promotion | undefined> {
  let updated: Promotion | undefined
  const promotions = getPromotionsCollection().map((p) => {
    if (p.id !== promotionId) return p
    updated = { ...p, ...updates }
    return updated
  })
  setPromotionsCollection(promotions)
  return Promise.resolve(updated)
}

export async function togglePromotionActive(promotionId: string): Promise<Promotion | undefined> {
  const promotion = getPromotionsCollection().find((p) => p.id === promotionId)
  if (!promotion) return Promise.resolve(undefined)
  return updatePromotion(promotionId, { active: !promotion.active })
}

export async function deletePromotion(promotionId: string): Promise<void> {
  setPromotionsCollection(getPromotionsCollection().filter((p) => p.id !== promotionId))
  return Promise.resolve()
}

export async function getPaymentSettings(storeId: string): Promise<PaymentMethod[]> {
  return Promise.resolve(getPaymentMethodsCollection().filter((method) => method.store_id === storeId))
}

export async function getDeliverySettings(storeId: string): Promise<DeliverySettings | undefined> {
  return Promise.resolve(getDeliverySettingsCollection().find((settings) => settings.store_id === storeId))
}

export async function getCartItemsByStore(storeId: string): Promise<CartItem[]> {
  return Promise.resolve(getCartItemsCollection().filter((item) => item.store_id === storeId))
}

export interface CreateOrderPayload {
  storeId: string
  customerName: string
  customerPhone?: string
  address?: string
  notes?: string
  deliveryType?: 'delivery' | 'pickup' | 'arrange'
  paymentMethod?: string
  paymentMethodKey?: OrderPaymentMethod
  paymentInstructions?: string
  externalPaymentUrl?: string
  pixKey?: string
  couponCode?: string
  deliveryFee?: number
  pickupAddress?: string
  estimatedMinutes?: number
  orderPlacedWhileClosed?: boolean
}

function derivePaymentStatus(paymentMethodKey?: OrderPaymentMethod, paymentMethodName?: string): PaymentStatus {
  if (paymentMethodKey === 'whatsapp') return 'to_be_arranged'
  if (!paymentMethodKey && paymentMethodName) {
    const lower = paymentMethodName.toLowerCase()
    if (lower.includes('whatsapp') || lower.includes('combinar')) return 'to_be_arranged'
  }
  return 'awaiting_payment'
}

export function derivePaymentMethodKey(paymentMethodName?: string): OrderPaymentMethod {
  if (!paymentMethodName) return 'custom'
  const lower = paymentMethodName.toLowerCase()
  if (lower.includes('pix')) return 'pix'
  if (lower.includes('dinheiro') || lower.includes('cash')) return 'cash'
  if (lower.includes('cartão') || lower.includes('cartao') || lower.includes('entrega')) return 'card_on_delivery'
  if (lower.includes('retirada') || lower.includes('pickup')) return 'pickup_payment'
  if (lower.includes('link') || lower.includes('externo')) return 'external_payment_link'
  if (lower.includes('whatsapp') || lower.includes('combinar')) return 'whatsapp'
  return 'custom'
}

export async function createOrderFromCart(payload: CreateOrderPayload): Promise<Order> {
  const allItems = getCartItemsCollection()
  const storeItems = allItems.filter((item) => item.store_id === payload.storeId)

  const items: OrderItem[] = storeItems.map((item) => ({
    product_id: item.product_id,
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
  }))

  const subtotal = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = payload.deliveryFee ?? 0

  // Validate and apply coupon
  let discountTotal = 0
  let couponCode: string | undefined
  if (payload.couponCode) {
    const result = await validateCoupon(payload.storeId, payload.couponCode, subtotal)
    if (result.valid) {
      discountTotal = result.discountAmount
      couponCode = result.coupon.code
      // Increment usedCount
      const coupons = getCouponsCollection().map((c) =>
        c.id === result.coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c,
      )
      setCouponsCollection(coupons)
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - discountTotal)

  const paymentMethodKey = payload.paymentMethodKey ?? derivePaymentMethodKey(payload.paymentMethod)
  const paymentStatus = derivePaymentStatus(paymentMethodKey, payload.paymentMethod)

  const order: Order = {
    id: getNextId('ord'),
    store_id: payload.storeId,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    address: payload.address,
    notes: payload.notes,
    deliveryType: payload.deliveryType,
    paymentMethod: payload.paymentMethod,
    paymentMethodKey,
    paymentInstructions: payload.paymentInstructions,
    externalPaymentUrl: payload.externalPaymentUrl,
    pixKey: payload.pixKey,
    items,
    subtotal,
    deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
    couponCode,
    discountTotal: discountTotal > 0 ? discountTotal : undefined,
    total,
    status: 'pending',
    paymentStatus,
    pickupAddress: payload.pickupAddress,
    estimatedMinutes: payload.estimatedMinutes,
    orderPlacedWhileClosed: payload.orderPlacedWhileClosed || undefined,
    createdAt: new Date().toISOString(),
  }

  const createdAt = order.createdAt
  const initialTimeline: OrderTimelineEntry[] = [
    makeTimelineEntry('status', 'Pedido criado', 'Pedido recebido pela vitrine da loja.', createdAt),
  ]
  if (payload.orderPlacedWhileClosed) {
    initialTimeline.push(
      makeTimelineEntry('note', 'Pedido enviado fora do horário', 'A loja atenderá no próximo horário de funcionamento.', createdAt),
    )
  }
  order.timeline = initialTimeline

  const orders = getOrdersCollection()
  setOrdersCollection([...orders, order])

  const remainingItems = allItems.filter((item) => item.store_id !== payload.storeId)
  setCartItemsCollection(remainingItems)

  return Promise.resolve(order)
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  return Promise.resolve(getOrdersCollection().find((order) => order.id === orderId))
}

/**
 * Ponto de entrada oficial para a vitrine pública de uma loja.
 *
 * Use sempre este método para resolver a loja a partir de uma URL pública
 * (/loja/:slug). O app NÃO deve carregar todas as lojas por padrão —
 * cada vitrine é carregada individualmente, sob demanda, pelo slug.
 *
 * Preparado para futura migração a Supabase:
 *   supabase.from('stores').select('*').eq('slug', slug).single()
 */
export async function getPublicStorefront(slug: string): Promise<Store | undefined> {
  return getStoreBySlug(slug)
}

// ---------------------------------------------------------------------------
// Seller store management
// ---------------------------------------------------------------------------

/** Retorna o ID da loja vinculada ao lojista atual (localStorage), ou null. */
export function getCurrentSellerStoreId(): string | null {
  return window.localStorage.getItem(STORAGE_KEYS.sellerStoreId) || null
}

/** Salva o ID da loja vinculada ao lojista atual no localStorage. */
export function setCurrentSellerStoreId(storeId: string): void {
  window.localStorage.setItem(STORAGE_KEYS.sellerStoreId, storeId)
}

export interface CreateStorePayload {
  name: string
  category: string
  city: string
  description: string
  whatsapp?: string
  primaryColor?: string
  accentColor?: string
  logoUrl?: string
  coverUrl?: string
}

/**
 * Cria uma nova loja no localMockStore, gera o slug automaticamente
 * e vincula a loja ao lojista atual via setCurrentSellerStoreId.
 */
export async function createStore(payload: CreateStorePayload): Promise<Store> {
  const stores = getStoresCollection()
  const baseSlug = normalizeSlug(payload.name)
  const slugExists = stores.some((store) => store.slug === baseSlug)
  const slug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug

  const store: Store = {
    id: getNextId('store'),
    name: payload.name.trim(),
    slug,
    category: payload.category.trim(),
    city: payload.city.trim(),
    description: payload.description.trim(),
    isActive: true,
    adminStatus: 'active',
    planId: 'free',
    rating: 0,
    whatsapp: payload.whatsapp?.trim() || undefined,
    primaryColor: payload.primaryColor || '#14213D',
    secondaryColor: '#E8EEF9',
    accentColor: payload.accentColor || '#3A86FF',
    logoUrl: payload.logoUrl?.trim() || undefined,
    coverUrl: payload.coverUrl?.trim() || undefined,
  }

  setStoresCollection([...stores, store])
  setCurrentSellerStoreId(store.id)
  return Promise.resolve(store)
}

export async function getAdminPlans(): Promise<PlatformPlan[]> {
  return Promise.resolve(getPlansCollection())
}

export async function updateAdminPlan(planId: string, updates: Partial<Omit<PlatformPlan, 'id'>>): Promise<PlatformPlan | undefined> {
  let updatedPlan: PlatformPlan | undefined
  const plans = getPlansCollection().map((plan) => {
    if (plan.id !== planId) return plan
    updatedPlan = { ...plan, ...updates }
    return updatedPlan
  })
  setPlansCollection(plans)
  return Promise.resolve(updatedPlan)
}

export async function updateStoreAdminStatus(
  storeId: string,
  adminStatus: NonNullable<Store['adminStatus']>,
): Promise<Store | undefined> {
  return updateStoreProfile(storeId, { isActive: adminStatus === 'active', adminStatus })
}

export async function updateStorePlan(storeId: string, planId: string): Promise<Store | undefined> {
  let updatedStore: Store | undefined
  const stores = getStoresCollection().map((store) => {
    if (store.id !== storeId) return store
    updatedStore = { ...store, planId }
    return updatedStore
  })
  setStoresCollection(stores)
  return Promise.resolve(updatedStore)
}

// ---------------------------------------------------------------------------
// Seller onboarding checklist
// ---------------------------------------------------------------------------

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  actionLabel: string
  to: string
}

export interface SellerOnboardingStatus {
  steps: OnboardingStep[]
  completedCount: number
  totalCount: number
  progressPercent: number
  isReadyToShare: boolean
}

/**
 * Calcula o status de onboarding do lojista para um dado storeId.
 * Verifica dados da loja, identidade visual, produtos, pagamentos e entrega.
 */
export async function getSellerOnboardingStatus(storeId: string): Promise<SellerOnboardingStatus> {
  const store = getStoresCollection().find((s) => s.id === storeId)
  const products = getProductsCollection().filter((p) => p.store_id === storeId && p.isActive)
  const paymentMethods = getPaymentMethodsCollection().filter((pm) => pm.store_id === storeId && pm.enabled)
  const deliverySettings = getDeliverySettingsCollection().find((ds) => ds.store_id === storeId)

  const storeDataDone = Boolean(
    store?.name?.trim() &&
      store?.category?.trim() &&
      (store?.city?.trim() || store?.description?.trim()),
  )

  const brandDone = Boolean(
    store?.themePreset ||
      store?.primaryColor ||
      store?.logoUrl ||
      store?.coverUrl ||
      store?.slogan,
  )

  const productDone = products.length > 0

  const paymentDone = paymentMethods.length > 0

  const deliveryDone = Boolean(
    deliverySettings?.deliveryEnabled ||
      deliverySettings?.pickupEnabled ||
      deliverySettings?.combineDelivery,
  )

  const storefrontDone = storeDataDone && productDone && paymentDone && deliveryDone && Boolean(store?.isActive)

  const steps: OnboardingStep[] = [
    {
      id: 'store-data',
      title: 'Dados da loja',
      description: storeDataDone
        ? 'Nome, categoria e cidade configurados.'
        : 'Preencha as informações básicas da sua loja.',
      completed: storeDataDone,
      required: true,
      actionLabel: 'Editar dados',
      to: '/lojista/minha-loja',
    },
    {
      id: 'brand',
      title: 'Identidade visual',
      description: brandDone
        ? 'Visual da loja personalizado.'
        : 'Adicione logo, cores e slogan da sua loja.',
      completed: brandDone,
      required: false,
      actionLabel: 'Personalizar marca',
      to: '/lojista/marca',
    },
    {
      id: 'product',
      title: 'Primeiro produto',
      description: productDone
        ? `${products.length} produto${products.length > 1 ? 's' : ''} ativo${products.length > 1 ? 's' : ''} no catálogo.`
        : 'Cadastre seu primeiro produto para começar a vender.',
      completed: productDone,
      required: true,
      actionLabel: productDone ? 'Ver produtos' : 'Cadastrar produto',
      to: productDone ? '/lojista/produtos' : '/lojista/produtos/novo',
    },
    {
      id: 'payment',
      title: 'Formas de pagamento',
      description: paymentDone
        ? 'Pelo menos uma forma de pagamento configurada.'
        : 'Configure como você quer receber seus pagamentos.',
      completed: paymentDone,
      required: true,
      actionLabel: 'Configurar pagamentos',
      to: '/lojista/pagamentos',
    },
    {
      id: 'delivery',
      title: 'Entrega ou retirada',
      description: deliveryDone
        ? 'Logística de entrega configurada.'
        : 'Defina retirada, entrega ou combinar com cliente.',
      completed: deliveryDone,
      required: true,
      actionLabel: 'Configurar entrega',
      to: '/lojista/entrega',
    },
    {
      id: 'storefront',
      title: 'Vitrine pronta',
      description: storefrontDone
        ? 'Sua vitrine está pronta para compartilhar!'
        : 'Complete as etapas anteriores para liberar sua vitrine.',
      completed: storefrontDone,
      required: true,
      actionLabel: 'Ver minha vitrine',
      to: '/lojista/minha-vitrine',
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const totalCount = steps.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return Promise.resolve({
    steps,
    completedCount,
    totalCount,
    progressPercent,
    isReadyToShare: storefrontDone,
  })
}

// ---------------------------------------------------------------------------
// Demo session utilities
// ---------------------------------------------------------------------------

/** Limpa somente os dados de sessão do cliente (lojas ativas, seguidas, carrinho). */
export function clearCustomerSession(): void {
  window.localStorage.removeItem(STORAGE_KEYS.activeStoreSlug)
  window.localStorage.removeItem(STORAGE_KEYS.invitedStoreSlug)
  window.localStorage.removeItem(STORAGE_KEYS.lastVisitedStoreSlug)
  window.localStorage.removeItem(STORAGE_KEYS.followedStores)
  window.localStorage.removeItem(STORAGE_KEYS.cartItems)
}

/** Limpa somente os dados de sessão do lojista (loja vinculada). */
export function clearSellerSession(): void {
  window.localStorage.removeItem(STORAGE_KEYS.sellerStoreId)
}

/** Limpa todos os dados demo (lojas, produtos, pedidos, sessões). */
export function clearAllDemoData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key))
}

// ---------------------------------------------------------------------------
// Customer order helpers
// ---------------------------------------------------------------------------

/**
 * Constrói a linha do tempo de um pedido.
 * Se o pedido já tiver timeline, retorna ordenada por data.
 * Caso contrário, sintetiza uma timeline mínima para compatibilidade com pedidos antigos.
 * A timeline sintetizada é apenas para exibição — não é persistida.
 */
export function buildOrderTimeline(order: Order): OrderTimelineEntry[] {
  if (order.timeline && order.timeline.length > 0) {
    return [...order.timeline].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  // Synthetic fallback for old orders without timeline
  const entries: OrderTimelineEntry[] = [
    {
      id: `${order.id}-synth-created`,
      type: 'status',
      label: 'Pedido criado',
      description: 'Pedido recebido pela vitrine da loja.',
      createdAt: order.createdAt,
    },
  ]

  if (order.orderPlacedWhileClosed) {
    entries.push({
      id: `${order.id}-synth-closed`,
      type: 'note',
      label: 'Pedido enviado fora do horário',
      description: 'A loja atenderá no próximo horário de funcionamento.',
      createdAt: order.createdAt,
    })
  }

  const statusInfo = statusTimelineLabel[order.status]
  if (statusInfo) {
    entries.push({
      id: `${order.id}-synth-status`,
      type: 'status',
      label: statusInfo.label,
      description: statusInfo.description,
      createdAt: order.createdAt,
    })
  }

  const paymentInfo = paymentTimelineLabel[order.paymentStatus]
  if (paymentInfo && order.paymentStatus !== 'awaiting_payment') {
    entries.push({
      id: `${order.id}-synth-payment`,
      type: 'payment',
      label: paymentInfo.label,
      description: paymentInfo.description,
      createdAt: order.paidAt ?? order.createdAt,
    })
  }

  return entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/**
 * Retorna todos os pedidos do cliente mock atual.
 * Como ainda não há customerId real, retorna todos os pedidos do localStorage
 * ordenados do mais recente ao mais antigo.
 * Preparado para futura migração: basta filtrar por customerId quando disponível.
 */
export async function getCustomerOrders(): Promise<Order[]> {
  const orders = getOrdersCollection()
  return Promise.resolve(
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )
}

/**
 * Retorna pedidos de uma loja específica para o cliente mock atual.
 */
export async function getOrdersByStoreForCustomer(storeId: string): Promise<Order[]> {
  const orders = getOrdersCollection().filter((order) => order.store_id === storeId)
  return Promise.resolve(
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )
}

/**
 * Retorna um pedido com os dados da loja associada.
 */
export async function getOrderWithStore(
  orderId: string,
): Promise<{ order: Order; store: Store | undefined } | undefined> {
  const order = getOrdersCollection().find((o) => o.id === orderId)
  if (!order) return Promise.resolve(undefined)
  const store = getStoresCollection().find((s) => s.id === order.store_id)
  return Promise.resolve({ order, store })
}

export interface RepeatOrderResult {
  addedCount: number
  skippedCount: number
  storeSlug: string | undefined
}

/**
 * Adiciona novamente ao carrinho os itens físicos de um pedido anterior.
 * Itens de produtos inativos ou removidos são ignorados.
 */
export async function repeatOrder(orderId: string): Promise<RepeatOrderResult> {
  const order = getOrdersCollection().find((o) => o.id === orderId)
  if (!order?.items?.length) {
    return Promise.resolve({ addedCount: 0, skippedCount: 0, storeSlug: undefined })
  }

  const store = getStoresCollection().find((s) => s.id === order.store_id)
  const products = getProductsCollection()
  let addedCount = 0
  let skippedCount = 0
  const cart = [...getCartItemsCollection()]

  for (const item of order.items) {
    const product = products.find((p) => p.id === item.product_id && p.store_id === order.store_id)

    if (!product || !product.isActive || product.productType !== 'physical') {
      skippedCount++
      continue
    }

    const existingIndex = cart.findIndex(
      (c) => c.product_id === item.product_id && c.store_id === order.store_id,
    )
    if (existingIndex >= 0) {
      cart[existingIndex] = { ...cart[existingIndex], quantity: cart[existingIndex].quantity + item.quantity }
    } else {
      cart.push({
        id: getNextId('cart'),
        store_id: order.store_id,
        product_id: item.product_id,
        productName: item.productName,
        quantity: item.quantity,
        price: product.price,
      })
    }
    addedCount++
  }

  setCartItemsCollection(cart)
  return Promise.resolve({ addedCount, skippedCount, storeSlug: store?.slug })
}

// ---------------------------------------------------------------------------
// Cart mutation helpers
// ---------------------------------------------------------------------------

/**
 * Atualiza a quantidade de um item no carrinho.
 * Se a quantidade for <= 0, o item é removido.
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
  const items = getCartItemsCollection()
  const nextItems =
    quantity <= 0
      ? items.filter((item) => item.id !== cartItemId)
      : items.map((item) => (item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item))
  setCartItemsCollection(nextItems)
  return Promise.resolve()
}

/**
 * Remove um item do carrinho pelo seu ID.
 */
export async function removeCartItem(cartItemId: string): Promise<void> {
  const items = getCartItemsCollection().filter((item) => item.id !== cartItemId)
  setCartItemsCollection(items)
  return Promise.resolve()
}

/**
 * Remove todos os itens do carrinho de uma loja específica.
 */
export async function clearCartByStore(storeId: string): Promise<void> {
  const items = getCartItemsCollection().filter((item) => item.store_id !== storeId)
  setCartItemsCollection(items)
  return Promise.resolve()
}

// ---------------------------------------------------------------------------
// Customer aggregation helpers
// ---------------------------------------------------------------------------

/**
 * Retorna uma chave de identidade para o cliente: telefone se disponível,
 * caso contrário usa o nome. Isso evita duplicação enquanto não há Auth real.
 */
function getCustomerKey(order: Order): string {
  const phone = order.customerPhone?.trim().replace(/\D/g, '')
  return phone || order.customerName.trim()
}

export interface CustomerSummary {
  /** Chave de identidade: telefone (apenas dígitos) ou nome. */
  key: string
  name: string
  phone?: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: string
  firstOrderAt: string
  averageTicket: number
  lastOrderStatus: Order['status']
  lastPaymentStatus: Order['paymentStatus']
  paymentPendingCount: number
  deliveredOrdersCount: number
  cancelledOrdersCount: number
}

/**
 * Agrega os pedidos de uma loja em uma lista de clientes únicos.
 * Identificação por telefone (prioritário) ou nome como fallback.
 */
export async function getStoreCustomers(storeId: string): Promise<CustomerSummary[]> {
  const orders = getOrdersCollection().filter((o) => o.store_id === storeId)

  const map = new Map<string, { orders: Order[]; name: string; phone?: string }>()

  for (const order of orders) {
    const key = getCustomerKey(order)
    const existing = map.get(key)
    if (existing) {
      existing.orders.push(order)
      // Prefer storing a phone if one order has it
      if (!existing.phone && order.customerPhone?.trim()) {
        existing.phone = order.customerPhone.trim()
      }
    } else {
      map.set(key, {
        orders: [order],
        name: order.customerName.trim(),
        phone: order.customerPhone?.trim() || undefined,
      })
    }
  }

  const customers: CustomerSummary[] = []

  for (const [key, { orders: customerOrders, name, phone }] of map.entries()) {
    const nonCancelled = customerOrders.filter((o) => o.status !== 'cancelled')
    const totalSpent = nonCancelled.reduce((sum, o) => sum + o.total, 0)

    const sorted = [...customerOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const lastOrder = sorted[0]
    const firstOrder = sorted[sorted.length - 1]

    const paymentPendingCount = customerOrders.filter(
      (o) =>
        o.status !== 'cancelled' &&
        o.paymentStatus !== 'paid' &&
        o.paymentStatus !== 'refunded' &&
        o.paymentStatus !== 'failed',
    ).length

    customers.push({
      key,
      name,
      phone,
      totalOrders: customerOrders.length,
      totalSpent,
      lastOrderAt: lastOrder.createdAt,
      firstOrderAt: firstOrder.createdAt,
      averageTicket: nonCancelled.length > 0 ? totalSpent / nonCancelled.length : 0,
      lastOrderStatus: lastOrder.status,
      lastPaymentStatus: lastOrder.paymentStatus,
      paymentPendingCount,
      deliveredOrdersCount: customerOrders.filter((o) => o.status === 'delivered').length,
      cancelledOrdersCount: customerOrders.filter((o) => o.status === 'cancelled').length,
    })
  }

  return Promise.resolve(customers)
}

/**
 * Retorna o resumo de um cliente específico da loja pelo telefone (ou nome como fallback).
 */
export async function getStoreCustomerByPhone(
  storeId: string,
  key: string,
): Promise<CustomerSummary | undefined> {
  const customers = await getStoreCustomers(storeId)
  return customers.find((c) => c.key === key)
}

/**
 * Retorna os pedidos de um cliente específico da loja, ordenados do mais recente ao mais antigo.
 */
export async function getCustomerOrdersByKey(storeId: string, key: string): Promise<Order[]> {
  const orders = getOrdersCollection().filter((o) => o.store_id === storeId && getCustomerKey(o) === key)
  return Promise.resolve(
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )
}

// ---------------------------------------------------------------------------
// Report aggregation helpers
// ---------------------------------------------------------------------------

export type ReportPeriod = 'today' | 'seven_days' | 'thirty_days' | 'all'

function filterOrdersByPeriod(orders: Order[], period: ReportPeriod): Order[] {
  if (period === 'all') return orders
  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const cutoff =
    period === 'today'
      ? startOfToday.getTime()
      : period === 'seven_days'
        ? now - 7 * 24 * 60 * 60 * 1000
        : now - 30 * 24 * 60 * 60 * 1000
  return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff)
}

export interface StoreReportSummary {
  totalOrders: number
  deliveredOrders: number
  cancelledOrders: number
  confirmedRevenue: number
  pendingRevenue: number
  averageTicket: number
  uniqueCustomers: number
  recurringCustomers: number
  totalProductsSold: number
  totalDiscounts: number
}

export async function getStoreReportSummary(storeId: string, period: ReportPeriod): Promise<StoreReportSummary> {
  const allOrders = getOrdersCollection().filter((o) => o.store_id === storeId)
  const orders = filterOrdersByPeriod(allOrders, period)

  const confirmedRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0)

  const pendingRevenue = orders
    .filter(
      (o) =>
        o.status !== 'cancelled' &&
        o.paymentStatus !== 'paid' &&
        o.paymentStatus !== 'refunded' &&
        o.paymentStatus !== 'failed',
    )
    .reduce((sum, o) => sum + o.total, 0)

  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid')
  const averageTicket = paidOrders.length > 0 ? confirmedRevenue / paidOrders.length : 0

  const customerMap = new Map<string, { count: number }>()
  for (const order of orders) {
    const key = getCustomerKey(order)
    const existing = customerMap.get(key)
    customerMap.set(key, { count: (existing?.count ?? 0) + 1 })
  }
  const uniqueCustomers = customerMap.size
  const recurringCustomers = Array.from(customerMap.values()).filter((c) => c.count >= 2).length

  const totalProductsSold = orders.reduce((sum, o) => {
    return sum + (o.items ?? []).reduce((s, item) => s + item.quantity, 0)
  }, 0)

  const totalDiscounts = orders.reduce((sum, o) => sum + (o.discountTotal ?? 0), 0)

  return Promise.resolve({
    totalOrders: orders.length,
    deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    confirmedRevenue,
    pendingRevenue,
    averageTicket,
    uniqueCustomers,
    recurringCustomers,
    totalProductsSold,
    totalDiscounts,
  })
}

export interface TopProduct {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
  orderCount: number
  isActive: boolean
}

export async function getTopProductsByStore(storeId: string, period: ReportPeriod): Promise<TopProduct[]> {
  const allOrders = getOrdersCollection().filter((o) => o.store_id === storeId)
  const orders = filterOrdersByPeriod(allOrders, period)
  const products = getProductsCollection().filter((p) => p.store_id === storeId)

  const map = new Map<string, { name: string; qty: number; revenue: number; orders: Set<string>; isActive: boolean }>()

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const existing = map.get(item.product_id)
      const product = products.find((p) => p.id === item.product_id)
      if (existing) {
        existing.qty += item.quantity
        existing.revenue += item.price * item.quantity
        existing.orders.add(order.id)
      } else {
        map.set(item.product_id, {
          name: item.productName,
          qty: item.quantity,
          revenue: item.price * item.quantity,
          orders: new Set([order.id]),
          isActive: product?.isActive ?? true,
        })
      }
    }
  }

  const result: TopProduct[] = Array.from(map.entries()).map(([productId, data]) => ({
    productId,
    productName: data.name,
    quantitySold: data.qty,
    revenue: data.revenue,
    orderCount: data.orders.size,
    isActive: data.isActive,
  }))

  return Promise.resolve(result.sort((a, b) => b.quantitySold - a.quantitySold))
}

export interface CouponPerformance {
  couponId: string
  code: string
  usageCount: number
  totalDiscount: number
  associatedRevenue: number
  active: boolean
}

export async function getCouponPerformanceByStore(storeId: string, period: ReportPeriod): Promise<CouponPerformance[]> {
  const allOrders = getOrdersCollection().filter((o) => o.store_id === storeId)
  const orders = filterOrdersByPeriod(allOrders, period)
  const coupons = getCouponsCollection().filter((c) => c.store_id === storeId)

  const map = new Map<string, { discount: number; revenue: number; count: number }>()

  for (const order of orders) {
    if (!order.couponCode) continue
    const existing = map.get(order.couponCode)
    if (existing) {
      existing.discount += order.discountTotal ?? 0
      existing.revenue += order.total
      existing.count += 1
    } else {
      map.set(order.couponCode, {
        discount: order.discountTotal ?? 0,
        revenue: order.total,
        count: 1,
      })
    }
  }

  const result: CouponPerformance[] = coupons.map((coupon) => {
    const data = map.get(coupon.code)
    return {
      couponId: coupon.id,
      code: coupon.code,
      usageCount: data?.count ?? 0,
      totalDiscount: data?.discount ?? 0,
      associatedRevenue: data?.revenue ?? 0,
      active: coupon.active,
    }
  })

  return Promise.resolve(result.sort((a, b) => b.usageCount - a.usageCount))
}

export interface PaymentStatusEntry {
  status: Order['paymentStatus']
  label: string
  count: number
  total: number
}

export async function getPaymentSummaryByStore(storeId: string, period: ReportPeriod): Promise<PaymentStatusEntry[]> {
  const allOrders = getOrdersCollection().filter((o) => o.store_id === storeId)
  const orders = filterOrdersByPeriod(allOrders, period)

  const labels: Record<Order['paymentStatus'], string> = {
    paid: 'Pago',
    awaiting_payment: 'Aguardando pagamento',
    to_be_arranged: 'A combinar',
    failed: 'Falhou',
    refunded: 'Estornado',
  }

  const statuses: Order['paymentStatus'][] = ['paid', 'awaiting_payment', 'to_be_arranged', 'failed', 'refunded']
  const result: PaymentStatusEntry[] = statuses.map((status) => {
    const filtered = orders.filter((o) => o.paymentStatus === status)
    return {
      status,
      label: labels[status],
      count: filtered.length,
      total: filtered.reduce((sum, o) => sum + o.total, 0),
    }
  })

  return Promise.resolve(result)
}

export interface OrderStatusEntry {
  status: Order['status']
  label: string
  count: number
  total: number
}

export async function getOrderStatusSummaryByStore(storeId: string, period: ReportPeriod): Promise<OrderStatusEntry[]> {
  const allOrders = getOrdersCollection().filter((o) => o.store_id === storeId)
  const orders = filterOrdersByPeriod(allOrders, period)

  const labels: Record<Order['status'], string> = {
    pending: 'Pendente',
    paid: 'Confirmado',
    preparing: 'Preparando',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  }

  const statuses: Order['status'][] = ['pending', 'paid', 'preparing', 'delivered', 'cancelled']
  const result: OrderStatusEntry[] = statuses.map((status) => {
    const filtered = orders.filter((o) => o.status === status)
    return {
      status,
      label: labels[status],
      count: filtered.length,
      total: filtered.reduce((sum, o) => sum + o.total, 0),
    }
  })

  return Promise.resolve(result)
}

// ---------------------------------------------------------------------------
// CRM — Relacionamento com o cliente
// ---------------------------------------------------------------------------

export interface CustomerRelationship {
  storeId: string
  customerKey: string
  notes?: string
  tags?: string[]
  preferences?: string
  preferredContactTime?: string
  nextFollowUpAt?: string
  lastContactedAt?: string
  createdAt: string
  updatedAt: string
}

function getCustomerRelationshipsCollection(): CustomerRelationship[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.customerRelationships)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CustomerRelationship[]) : []
  } catch {
    return []
  }
}

function setCustomerRelationshipsCollection(relationships: CustomerRelationship[]): void {
  window.localStorage.setItem(STORAGE_KEYS.customerRelationships, JSON.stringify(relationships))
}

export async function getCustomerRelationship(
  storeId: string,
  customerKey: string,
): Promise<CustomerRelationship | undefined> {
  const all = getCustomerRelationshipsCollection()
  return Promise.resolve(all.find((r) => r.storeId === storeId && r.customerKey === customerKey))
}

export async function updateCustomerRelationship(
  storeId: string,
  customerKey: string,
  updates: Partial<Omit<CustomerRelationship, 'storeId' | 'customerKey' | 'createdAt' | 'updatedAt'>>,
): Promise<CustomerRelationship> {
  const all = getCustomerRelationshipsCollection()
  const now = new Date().toISOString()
  const index = all.findIndex((r) => r.storeId === storeId && r.customerKey === customerKey)

  let updated: CustomerRelationship
  if (index >= 0) {
    updated = { ...all[index], ...updates, updatedAt: now }
    const next = [...all]
    next[index] = updated
    setCustomerRelationshipsCollection(next)
  } else {
    updated = {
      storeId,
      customerKey,
      ...updates,
      createdAt: now,
      updatedAt: now,
    }
    setCustomerRelationshipsCollection([...all, updated])
  }

  return Promise.resolve(updated)
}

export async function getCustomerRelationshipsByStore(storeId: string): Promise<CustomerRelationship[]> {
  const all = getCustomerRelationshipsCollection()
  return Promise.resolve(all.filter((r) => r.storeId === storeId))
}
