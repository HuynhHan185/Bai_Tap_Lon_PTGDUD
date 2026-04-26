import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AppShell from '../components/layout/AppShell'

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
        element: <CheckoutPage />,
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
        element: <AccountDashboardPage />,
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
])