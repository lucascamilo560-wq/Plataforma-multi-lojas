import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { LoginPage } from '../../features/auth/LoginPage'
import { CartPage } from '../../features/cart/CartPage'
import { CheckoutPage } from '../../features/checkout/CheckoutPage'
import { CustomerHomePage } from '../../features/customer-home/CustomerHomePage'
import { ExploreStoresPage } from '../../features/customer-home/ExploreStoresPage'
import { StorePage } from '../../features/customer-home/StorePage'
import { StoreOrdersPage } from '../../features/orders/StoreOrdersPage'
import { StoreProductsPage } from '../../features/products/StoreProductsPage'
import { AdminDashboardPage } from '../../features/super-admin/AdminDashboardPage'
import { AdminStoresPage } from '../../features/super-admin/AdminStoresPage'
import { StoreDashboardPage } from '../../features/store-dashboard/StoreDashboardPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route index element={<CustomerHomePage />} />
        <Route path="/stores" element={<ExploreStoresPage />} />
        <Route path="/stores/:storeId" element={<StorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/dashboard" element={<StoreDashboardPage />} />
        <Route path="/dashboard/products" element={<StoreProductsPage />} />
        <Route path="/dashboard/orders" element={<StoreOrdersPage />} />

        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/stores" element={<AdminStoresPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
