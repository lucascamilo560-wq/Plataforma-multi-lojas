import type { AdminSummary, CartItem, Order, Product, Store } from '../types'

const CART_STORAGE_KEY = 'marketplace:cart-items'

const stores: Store[] = [
  {
    id: 'store-1',
    name: 'Mercado Central',
    slug: 'mercado-central',
    category: 'Supermercado',
    description: 'Itens de mercado, mercearia e hortifruti.',
    isActive: true,
    rating: 4.8,
    city: 'São Paulo',
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
  },
]

const products: Product[] = [
  {
    id: 'prod-1',
    store_id: 'store-1',
    name: 'Cesta de frutas',
    description: 'Seleção de frutas da estação.',
    price: 29.9,
    stock: 26,
    category: 'Hortifruti',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
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
  },
]

const orders: Order[] = [
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

function readCartItemsFromStorage(): CartItem[] {
  const rawValue = window.localStorage.getItem(CART_STORAGE_KEY)

  if (!rawValue) {
    return [...defaultCartItems]
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CartItem[]
    return Array.isArray(parsedValue) ? parsedValue : [...defaultCartItems]
  } catch {
    return [...defaultCartItems]
  }
}

function persistCartItems(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export async function getStores(): Promise<Store[]> {
  return Promise.resolve(stores)
}

export async function getStoreById(storeId: string): Promise<Store | undefined> {
  return Promise.resolve(stores.find((store) => store.id === storeId))
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  return Promise.resolve(products.filter((product) => product.store_id === storeId))
}

export async function getStoreOrders(storeId: string): Promise<Order[]> {
  return Promise.resolve(orders.filter((order) => order.store_id === storeId))
}

export async function getCartItems(): Promise<CartItem[]> {
  const items = readCartItemsFromStorage()
  persistCartItems(items)
  return Promise.resolve(items)
}

export async function addProductToCart(product: Product): Promise<void> {
  const items = readCartItemsFromStorage()
  const existingItem = items.find(
    (item) => item.product_id === product.id && item.store_id === product.store_id,
  )

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    items.push({
      id: `cart-${Date.now()}`,
      store_id: product.store_id,
      product_id: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
    })
  }

  persistCartItems(items)

  return Promise.resolve()
}

export async function getAdminSummary(): Promise<AdminSummary> {
  return Promise.resolve({
    totalStores: stores.length,
    activeStores: stores.filter((store) => store.isActive).length,
    totalOrders: orders.length,
    grossRevenue: orders.reduce((total, order) => total + order.total, 0),
  })
}
