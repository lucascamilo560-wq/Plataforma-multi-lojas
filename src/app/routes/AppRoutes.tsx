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
import { ProtectedRoute } from './ProtectedRoute'

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['store_admin']}>
              <StoreDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute allowedRoles={['store_admin']}>
              <StoreProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/orders"
          element={
            <ProtectedRoute allowedRoles={['store_admin']}>
              <StoreOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminStoresPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
