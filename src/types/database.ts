// Tipos gerados a partir do schema inicial do Supabase.
// Atualizar sempre que uma nova migration for criada.

// ------------------------------------------------------------
// Enums
// ------------------------------------------------------------

export type UserRole = 'customer' | 'store_admin' | 'super_admin'

export type StoreStatus = 'pending' | 'active' | 'suspended' | 'inactive'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'pix' | 'card' | 'cash' | 'pickup_payment'

// ------------------------------------------------------------
// Linhas das tabelas (leitura)
// ------------------------------------------------------------

export interface ProfileRow {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface StoreRow {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  logo_url: string | null
  banner_url: string | null
  status: StoreStatus
  city: string | null
  state: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface StoreMemberRow {
  id: string
  store_id: string
  user_id: string
  role: UserRole
  created_at: string
}

export interface CategoryRow {
  id: string
  store_id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface ProductRow {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerAddressRow {
  id: string
  user_id: string
  label: string | null
  street: string
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string
  state: string
  zip_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface OrderRow {
  id: string
  store_id: string
  customer_id: string
  address_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  subtotal: number
  delivery_fee: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  store_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface CartItemRow {
  id: string
  store_id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Payloads de inserção (campos obrigatórios)
// ------------------------------------------------------------

// Campos gerenciados pelo banco – excluídos dos payloads de inserção.
type ServerFields = 'id' | 'created_at' | 'updated_at'

// Helper: campos obrigatórios + opcionais, sem campos de servidor.
type InsertPayload<Row, RequiredKeys extends keyof Row> = Pick<Row, RequiredKeys> &
  Partial<Omit<Row, RequiredKeys | ServerFields>>

type ProfileRequiredKeys = 'id'
export type InsertProfile = InsertPayload<ProfileRow, ProfileRequiredKeys>

type StoreRequiredKeys = 'owner_id' | 'name' | 'slug'
export type InsertStore = InsertPayload<StoreRow, StoreRequiredKeys>

type StoreMemberRequiredKeys = 'store_id' | 'user_id'
export type InsertStoreMember = InsertPayload<StoreMemberRow, StoreMemberRequiredKeys>

type CategoryRequiredKeys = 'store_id' | 'name' | 'slug'
export type InsertCategory = InsertPayload<CategoryRow, CategoryRequiredKeys>

type ProductRequiredKeys = 'store_id' | 'name' | 'price'
export type InsertProduct = InsertPayload<ProductRow, ProductRequiredKeys>

type CustomerAddressRequiredKeys = 'user_id' | 'street' | 'city' | 'state' | 'zip_code'
export type InsertCustomerAddress = InsertPayload<CustomerAddressRow, CustomerAddressRequiredKeys>

type OrderRequiredKeys = 'store_id' | 'customer_id' | 'subtotal' | 'delivery_fee' | 'total'
export type InsertOrder = InsertPayload<OrderRow, OrderRequiredKeys>

type OrderItemRequiredKeys = 'order_id' | 'store_id' | 'product_name' | 'quantity' | 'unit_price' | 'total_price'
export type InsertOrderItem = InsertPayload<OrderItemRow, OrderItemRequiredKeys>

type CartItemRequiredKeys = 'store_id' | 'user_id' | 'product_id'
export type InsertCartItem = InsertPayload<CartItemRow, CartItemRequiredKeys>

// ------------------------------------------------------------
// Tipo Database completo (para uso com createClient<Database>)
// ------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: InsertProfile
        Update: Partial<InsertProfile>
      }
      stores: {
        Row: StoreRow
        Insert: InsertStore
        Update: Partial<InsertStore>
      }
      store_members: {
        Row: StoreMemberRow
        Insert: InsertStoreMember
        Update: Partial<InsertStoreMember>
      }
      categories: {
        Row: CategoryRow
        Insert: InsertCategory
        Update: Partial<InsertCategory>
      }
      products: {
        Row: ProductRow
        Insert: InsertProduct
        Update: Partial<InsertProduct>
      }
      customer_addresses: {
        Row: CustomerAddressRow
        Insert: InsertCustomerAddress
        Update: Partial<InsertCustomerAddress>
      }
      orders: {
        Row: OrderRow
        Insert: InsertOrder
        Update: Partial<InsertOrder>
      }
      order_items: {
        Row: OrderItemRow
        Insert: InsertOrderItem
        Update: Partial<InsertOrderItem>
      }
      cart_items: {
        Row: CartItemRow
        Insert: InsertCartItem
        Update: Partial<InsertCartItem>
      }
    }
    Enums: {
      user_role: UserRole
      store_status: StoreStatus
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
    }
  }
}
