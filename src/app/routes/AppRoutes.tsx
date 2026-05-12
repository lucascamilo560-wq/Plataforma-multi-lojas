import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { CustomerLayout } from '../../components/layout/CustomerLayout'
import { SellerLayout } from '../../components/layout/SellerLayout'
import { StorefrontLayout } from '../../components/layout/StorefrontLayout'
import { LoginPage } from '../../features/auth/LoginPage'
import { CartPage } from '../../features/cart/CartPage'
import { CheckoutPage } from '../../features/checkout/CheckoutPage'
import { CustomerHomePage } from '../../features/customer-home/CustomerHomePage'
import { CustomerOrdersPage } from '../../features/customer-home/CustomerOrdersPage'
import { CustomerProfilePage } from '../../features/customer-home/CustomerProfilePage'
import { ExploreStoresPage } from '../../features/customer-home/ExploreStoresPage'
import { StorePage } from '../../features/customer-home/StorePage'
import { StoreOrdersPage } from '../../features/orders/StoreOrdersPage'
import { SellerNewProductPage } from '../../features/products/SellerNewProductPage'
import { StoreProductsPage } from '../../features/products/StoreProductsPage'
import { StorefrontCartPage } from '../../features/storefront/StorefrontCartPage'
import { StorefrontCheckoutPage } from '../../features/storefront/StorefrontCheckoutPage'
import { StorefrontOrderPage } from '../../features/storefront/StorefrontOrderPage'
import { StorefrontPage } from '../../features/storefront/StorefrontPage'
import { AdminCustomersPage } from '../../features/super-admin/AdminCustomersPage'
import { AdminDashboardPage } from '../../features/super-admin/AdminDashboardPage'
import { AdminOrdersPage } from '../../features/super-admin/AdminOrdersPage'
import { AdminPlansPage } from '../../features/super-admin/AdminPlansPage'
import { AdminSettingsPage } from '../../features/super-admin/AdminSettingsPage'
import { AdminSellersPage } from '../../features/super-admin/AdminSellersPage'
import { AdminStoresPage } from '../../features/super-admin/AdminStoresPage'
import { AdminSupportPage } from '../../features/super-admin/AdminSupportPage'
import { SellerBrandPage } from '../../features/store-dashboard/SellerBrandPage'
import { SellerCouponsPage } from '../../features/store-dashboard/SellerCouponsPage'
import { SellerCustomersPage } from '../../features/store-dashboard/SellerCustomersPage'
import { SellerDeliveryPage } from '../../features/store-dashboard/SellerDeliveryPage'
import { StoreDashboardPage } from '../../features/store-dashboard/StoreDashboardPage'
import { SellerHelpPage } from '../../features/store-dashboard/SellerHelpPage'
import { SellerPaymentsPage } from '../../features/store-dashboard/SellerPaymentsPage'
import { SellerPromotionsPage } from '../../features/store-dashboard/SellerPromotionsPage'
import { SellerReportsPage } from '../../features/store-dashboard/SellerReportsPage'
import { SellerStorePage } from '../../features/store-dashboard/SellerStorePage'
import { useMockSession } from '../../hooks/useMockSession'
import { ProtectedRoute } from './ProtectedRoute'

function HomeRedirect() {
  const { role } = useMockSession()

  if (role === 'store_admin') {
    return <Navigate to="/lojista" replace />
  }

  if (role === 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/cliente" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerHomePage />} />
        <Route path="explorar" element={<ExploreStoresPage />} />
        <Route path="carrinho" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="pedidos" element={<CustomerOrdersPage />} />
        <Route path="perfil" element={<CustomerProfilePage />} />
      </Route>

      <Route path="/cliente/loja/:slug" element={<CustomerLayout />}>
        <Route index element={<StorePage />} />
      </Route>

      <Route path="/loja/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorefrontPage />} />
        <Route path="carrinho" element={<StorefrontCartPage />} />
        <Route path="checkout" element={<StorefrontCheckoutPage />} />
        <Route path="pedido/:orderId" element={<StorefrontOrderPage />} />
      </Route>

      <Route
        path="/lojista"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StoreDashboardPage />} />
        <Route path="minha-loja" element={<SellerStorePage />} />
        <Route path="produtos" element={<StoreProductsPage />} />
        <Route path="produtos/novo" element={<SellerNewProductPage />} />
        <Route path="pedidos" element={<StoreOrdersPage />} />
        <Route path="promocoes" element={<SellerPromotionsPage />} />
        <Route path="cupons" element={<SellerCouponsPage />} />
        <Route path="clientes" element={<SellerCustomersPage />} />
        <Route path="pagamentos" element={<SellerPaymentsPage />} />
        <Route path="entrega" element={<SellerDeliveryPage />} />
        <Route path="marca" element={<SellerBrandPage />} />
        <Route path="relatorios" element={<SellerReportsPage />} />
        <Route path="ajuda" element={<SellerHelpPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="lojas" element={<AdminStoresPage />} />
        <Route path="lojistas" element={<AdminSellersPage />} />
        <Route path="clientes" element={<AdminCustomersPage />} />
        <Route path="planos" element={<AdminPlansPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
        <Route path="suporte" element={<AdminSupportPage />} />
        <Route path="configuracoes" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
