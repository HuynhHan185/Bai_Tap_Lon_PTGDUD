import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AppShell from '../components/layout/AppShell'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import AdminShell from '../components/layout/AdminShell'
import AdminRoute from '../components/layout/AdminRoute'

const HomePage = lazy(() => import('../pages/HomePage'))
const CategoryPage = lazy(() => import('../pages/CategoryPage'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))
const AuthPage = lazy(() => import('../pages/account/AuthPage'))
const AccountDashboardPage = lazy(() =>
  import('../pages/account/AccountDashboardPage'),
)

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminProductPage = lazy(() => import('../pages/admin/AdminProductPage'))
const AdminCategoryPage = lazy(() => import('../pages/admin/AdminCategoryPage'))
const AdminOrderPage = lazy(() => import('../pages/admin/AdminOrderPage'))
const AdminUserPage = lazy(() => import('../pages/admin/AdminUserPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'danh-muc/:slug',
        element: <CategoryPage />,
      },
      {
        path: 'tim-kiem',
        element: <CategoryPage />,
      },
      {
        path: 'san-pham/:slug',
        element: <ProductDetailPage />,
      },
      {
        path: 'gio-hang',
        element: <CartPage />,
      },
      {
        path: 'thanh-toan',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gioi-thieu',
        element: <AboutPage />,
      },
      {
        path: 'lien-he',
        element: <ContactPage />,
      },
      {
        path: 'tai-khoan',
        element: (
          <ProtectedRoute>
            <AccountDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tai-khoan/dang-nhap',
        element: <AuthPage mode="login" />,
      },
      {
        path: 'tai-khoan/dang-ky',
        element: <AuthPage mode="register" />,
      },
      {
        path: 'tai-khoan/quen-mat-khau',
        element: <AuthPage mode="forgot" />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminShell />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'products',
        element: <AdminProductPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoryPage />,
      },
      {
        path: 'orders',
        element: <AdminOrderPage />,
      },
      {
        path: 'users',
        element: <AdminUserPage />,
      },
    ],
  },
])