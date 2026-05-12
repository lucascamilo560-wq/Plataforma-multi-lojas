import type { AdminSummary, CartItem, Order, OrderItem, OrderStatus, Product, Store } from '../types'

export interface Coupon {
  id: string
  store_id: string
  code: string
  discountPercent: number
  active: boolean
}

export interface Promotion {
  id: string
  store_id: string
  title: string
  description: string
  active: boolean
}

export interface PaymentMethod {
  id: string
  store_id: string
  name: string
  enabled: boolean
}

export interface DeliverySettings {
  store_id: string
  deliveryEnabled: boolean
  pickupEnabled: boolean
  estimatedMinutes: number
  fee: number
}

const STORAGE_KEYS = {
  stores: 'marketplace:stores',
  products: 'marketplace:products',
  orders: 'marketplace:orders',
  coupons: 'marketplace:coupons',
  promotions: 'marketplace:promotions',
  paymentMethods: 'marketplace:payment-methods',
  deliverySettings: 'marketplace:delivery-settings',
  cartItems: 'marketplace:cart-items',
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
  },
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
  },
]

const defaultOrders: Order[] = [
  {
    id: 'ord-1',
    store_id: 'store-1',
    customerName: 'Ana Souza',
    total: 89.8,
    status: 'preparing',
    createdAt: '2026-05-11T10:35:00.000Z',
  },
  {
    id: 'ord-2',
    store_id: 'store-1',
    customerName: 'Carlos Lima',
    total: 42,
    status: 'pending',
    createdAt: '2026-05-11T09:10:00.000Z',
  },
  {
    id: 'ord-3',
    store_id: 'store-2',
    customerName: 'Marina Alves',
    total: 119.9,
    status: 'paid',
    createdAt: '2026-05-10T18:22:00.000Z',
  },
]

const defaultCoupons: Coupon[] = [
  { id: 'coupon-1', store_id: 'store-1', code: 'BEMVINDO10', discountPercent: 10, active: true },
]

const defaultPromotions: Promotion[] = [
  {
    id: 'promo-1',
    store_id: 'store-1',
    title: 'Semana de hortifruti',
    description: 'Seleção com desconto para itens frescos.',
    active: true,
  },
]

const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'pm-1', store_id: 'store-1', name: 'Pix', enabled: true },
  { id: 'pm-2', store_id: 'store-1', name: 'Cartão na entrega', enabled: true },
  { id: 'pm-3', store_id: 'store-2', name: 'Pix', enabled: true },
]

const defaultDeliverySettings: DeliverySettings[] = [
  { store_id: 'store-1', deliveryEnabled: true, pickupEnabled: true, estimatedMinutes: 45, fee: 6 },
  { store_id: 'store-2', deliveryEnabled: true, pickupEnabled: false, estimatedMinutes: 60, fee: 8 },
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
  return products.map((product) => ({
    ...product,
    stock: Number.isFinite(product.stock) ? Math.max(0, product.stock) : 0,
    price: Number.isFinite(product.price) ? Math.max(0, product.price) : 0,
    isActive: product.isActive ?? true,
  }))
}

function normalizeOrders(orders: Order[]): Order[] {
  return orders.map((order) => ({
    ...order,
    status: validOrderStatus.includes(order.status) ? order.status : 'pending',
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

function getPaymentMethodsCollection() {
  return readCollection(STORAGE_KEYS.paymentMethods, defaultPaymentMethods)
}

function setPaymentMethodsCollection(paymentMethods: PaymentMethod[]) {
  persistCollection(STORAGE_KEYS.paymentMethods, paymentMethods)
}

function getDeliverySettingsCollection() {
  return readCollection(STORAGE_KEYS.deliverySettings, defaultDeliverySettings)
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

export async function addProductToCart(product: Product): Promise<void> {
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

  return Promise.resolve({
    totalStores: stores.length,
    activeStores: stores.filter((store) => store.isActive).length,
    totalOrders: orders.length,
    grossRevenue: orders.reduce((total, order) => total + order.total, 0),
  })
}

export async function createProduct(
  payload: Omit<Product, 'id'> & { isActive?: boolean },
): Promise<Product> {
  const products = getProductsCollection()
  const product: Product = {
    ...payload,
    id: getNextId('prod'),
    stock: Math.max(0, payload.stock),
    price: Math.max(0, payload.price),
    isActive: payload.isActive ?? true,
  }

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

    updatedProduct = {
      ...product,
      ...updates,
      stock: updates.stock === undefined ? product.stock : Math.max(0, updates.stock),
      price: updates.price === undefined ? product.price : Math.max(0, updates.price),
      isActive: updates.isActive ?? product.isActive,
    }

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
  updates: Partial<Pick<Store, 'name' | 'description' | 'category' | 'city' | 'logoUrl' | 'coverUrl' | 'isActive'>>,
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
  updates: Pick<Store, 'primaryColor' | 'secondaryColor' | 'accentColor' | 'logoUrl' | 'coverUrl'>,
): Promise<Store | undefined> {
  return updateStoreProfile(storeId, updates)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | undefined> {
  let updatedOrder: Order | undefined

  const orders = getOrdersCollection().map((order) => {
    if (order.id !== orderId) {
      return order
    }

    updatedOrder = { ...order, status }
    return updatedOrder
  })

  setOrdersCollection(orders)
  return Promise.resolve(updatedOrder)
}

export async function createCoupon(payload: Omit<Coupon, 'id'>): Promise<Coupon> {
  const coupons = getCouponsCollection()
  const coupon: Coupon = { ...payload, id: getNextId('coupon') }

  setCouponsCollection([...coupons, coupon])

  return Promise.resolve(coupon)
}

export async function updatePaymentSettings(
  storeId: string,
  paymentMethods: Array<Pick<PaymentMethod, 'name' | 'enabled'>>,
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
  deliveryType?: 'delivery' | 'pickup'
  paymentMethod?: string
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

  const total = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order: Order = {
    id: getNextId('ord'),
    store_id: payload.storeId,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    address: payload.address,
    notes: payload.notes,
    deliveryType: payload.deliveryType,
    paymentMethod: payload.paymentMethod,
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

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
