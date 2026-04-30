# Admin Dashboard — Xây dựng giao diện quản trị

## Tổng quan

Xây dựng hoàn chỉnh hệ thống Admin Dashboard cho ứng dụng CamVàng e-commerce, bao gồm 5 trang quản trị với giao diện hiện đại, tính năng CRUD đầy đủ, và routing được bảo vệ bằng role-based access control.

## Các thay đổi

### 1. Router — Thêm admin routes

```diff:router.jsx
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AppShell from '../components/layout/AppShell'
import ProtectedRoute from '../components/layout/ProtectedRoute'

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
])
===
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
```

- Thêm route group `/admin` với `AdminShell` layout và `AdminRoute` protection
- 5 child routes: Dashboard, Products, Categories, Orders, Users
- Lazy loading cho tất cả admin pages

---

### 2. AdminShell — Nâng cấp layout sidebar

```diff:AdminShell.jsx
import { useState } from 'react'
import { Layout, Menu, Button, theme, Dropdown } from 'antd'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  ProfileOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { logout, selectUser } from '../../features/user/userSlice'

const { Header, Sider, Content } = Layout

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/tai-khoan/dang-nhap')
  }

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
    { key: '/admin/orders', icon: <ProfileOutlined />, label: 'Đơn hàng' },
    { key: '/admin/users', icon: <UserOutlined />, label: 'Người dùng' },
  ]

  const userMenu = {
    items: [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: <Link to="/">Về trang chủ</Link>,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: '64px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: collapsed ? '12px' : '16px', overflow: 'hidden' }}>
          {collapsed ? 'CV' : 'CAMVANG ADMIN'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={userMenu} placement="bottomRight">
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined />
              {user?.fullName || user?.username}
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
===
import { useState } from 'react'
import { Layout, Menu, Button, theme, Dropdown, Typography, Space, Badge, Avatar, Tooltip } from 'antd'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  ProfileOutlined,
  LogoutOutlined,
  HomeOutlined,
  SettingOutlined,
  BellOutlined,
  CrownOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { logout, selectUser } from '../../features/user/userSlice'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/tai-khoan/dang-nhap')
  }

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
    { key: '/admin/orders', icon: <ProfileOutlined />, label: 'Đơn hàng' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Người dùng' },
  ]

  const userMenu = {
    items: [
      {
        key: 'info',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Text strong>{user?.fullName || user?.username}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: <Link to="/">Về trang chủ</Link>,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        onClick: handleLogout,
        danger: true,
      },
    ],
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          height: '64px',
          margin: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #fa8c16, #f5222d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            CV
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                lineHeight: '20px',
                whiteSpace: 'nowrap',
              }}>
                CamVàng Admin
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 11,
                lineHeight: '16px',
                whiteSpace: 'nowrap',
              }}>
                Quản trị hệ thống
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: 'transparent',
            borderRight: 'none',
          }}
        />

        {/* Sidebar Footer */}
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            padding: '12px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 8,
          }}>
            <Space>
              <Avatar
                size="small"
                style={{ backgroundColor: '#fa8c16' }}
                icon={<CrownOutlined />}
              />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, display: 'block' }}>
                  {user?.fullName}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, display: 'block' }}>
                  Quản trị viên
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 48 }}
          />
          <Space size="middle">
            <Tooltip title="Về trang chủ">
              <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')} />
            </Tooltip>
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s' }}>
                <Avatar
                  size="small"
                  style={{ backgroundColor: '#fa8c16' }}
                  icon={<CrownOutlined />}
                />
                <Text strong>{user?.fullName || user?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: '24px',
          padding: 24,
          minHeight: 360,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
          CamVàng Admin ©{new Date().getFullYear()} — Hệ thống quản trị gia dụng
        </Footer>
      </Layout>
    </Layout>
  )
}

```

- Fixed sidebar với gradient background
- Logo "CV" với tên thương hiệu CamVàng Admin
- User info ở cuối sidebar
- Sticky header với nút về trang chủ
- Dropdown user menu với thông tin + đăng xuất
- Footer

---

### 3. AdminDashboardPage — Trang tổng quan

```diff:AdminDashboardPage.jsx
import { Card, Col, Row, Statistic, Typography } from 'antd'
import { ShoppingOutlined, UserOutlined, ProfileOutlined, DollarOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { getProducts, getAllOrders, getAllUsers } from '../../services/api'

const { Title } = Typography

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [products, orders, users] = await Promise.all([
          getProducts(),
          getAllOrders(),
          getAllUsers()
        ])
        
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0)

        setStats({
          products: products?.data?.length || products?.length || 0,
          orders: orders?.length || 0,
          users: users?.length || 0,
          revenue: totalRevenue
        })
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }
    loadStats()
  }, [])

  return (
    <div>
      <Title level={2}>Tổng quan hệ thống</Title>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng doanh thu"
              value={stats.revenue}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Đơn hàng"
              value={stats.orders}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Sản phẩm"
              value={stats.products}
              valueStyle={{ color: '#1677ff' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Khách hàng"
              value={stats.users}
              valueStyle={{ color: '#d48806' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
===
import { Card, Col, Row, Statistic, Typography, Table, Tag, Timeline, Progress, Space, Badge, Divider, Tooltip } from 'antd'
import {
  ShoppingOutlined,
  UserOutlined,
  ProfileOutlined,
  DollarOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  FireOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { getProducts, getAllOrders, getAllUsers, getCategories } from '../../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusMap = {
  pending: { label: 'Chờ xử lý', color: 'orange', icon: <ClockCircleOutlined /> },
  shipping: { label: 'Đang giao', color: 'blue', icon: <TruckOutlined /> },
  completed: { label: 'Hoàn thành', color: 'green', icon: <CheckCircleOutlined /> },
  cancelled: { label: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
}

const paymentMethodMap = {
  cod: 'Tiền mặt',
  bank: 'Chuyển khoản',
  momo: 'MoMo',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    categories: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [ordersByStatus, setOrdersByStatus] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        const [products, orders, users, categories] = await Promise.all([
          getProducts(),
          getAllOrders(),
          getAllUsers(),
          getCategories(),
        ])

        const productList = products?.data || products || []
        const orderList = orders || []
        const userList = users || []
        const categoryList = categories || []

        const totalRevenue = orderList.reduce((sum, order) => sum + Number(order.subtotal || 0), 0)
        const completedRevenue = orderList
          .filter(o => o.status === 'completed')
          .reduce((sum, order) => sum + Number(order.subtotal || 0), 0)

        const pending = orderList.filter(o => o.status === 'pending').length
        const completed = orderList.filter(o => o.status === 'completed').length
        const cancelled = orderList.filter(o => o.status === 'cancelled').length
        const shipping = orderList.filter(o => o.status === 'shipping').length

        setStats({
          products: productList.length,
          orders: orderList.length,
          users: userList.length,
          revenue: totalRevenue,
          completedRevenue,
          categories: categoryList.length,
          pendingOrders: pending,
          completedOrders: completed,
          cancelledOrders: cancelled,
          shippingOrders: shipping,
        })

        setOrdersByStatus({ pending, completed, cancelled, shipping })

        // Recent orders - top 5
        const sorted = [...orderList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentOrders(sorted.slice(0, 5))

        // Top products by frequency in orders
        const productCount = {}
        orderList.forEach(order => {
          (order.items || []).forEach(item => {
            productCount[item.name] = (productCount[item.name] || 0) + (item.quantity || 1)
          })
        })
        const topProds = Object.entries(productCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))
        setTopProducts(topProds)

      } catch (err) {
        console.error('Failed to load stats', err)
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  const recentOrderColumns = [
    {
      title: 'Mã ĐH',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code style={{ fontSize: 12 }}>{id?.slice(0, 8)}...</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (val) => (
        <Text strong style={{ color: '#cf1322' }}>
          {new Intl.NumberFormat('vi-VN').format(val)}₫
        </Text>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => <Tag>{paymentMethodMap[method] || method}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const s = statusMap[status] || { label: status, color: 'default' }
        return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>
      },
    },
  ]

  const statCardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <BarChartOutlined style={{ fontSize: 28, color: '#fa8c16' }} />
        <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
      </div>

      {/* ── Stats Cards ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ ...statCardStyle, background: 'linear-gradient(135deg, #fff1f0 0%, #fff 100%)' }}
            hoverable
          >
            <Statistic
              title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Tổng doanh thu</Text>}
              value={stats.revenue}
              precision={0}
              valueStyle={{ color: '#cf1322', fontSize: 28, fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.completedOrders} đơn hoàn thành
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ ...statCardStyle, background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)' }}
            hoverable
          >
            <Statistic
              title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Đơn hàng</Text>}
              value={stats.orders}
              valueStyle={{ color: '#3f8600', fontSize: 28, fontWeight: 700 }}
              prefix={<ProfileOutlined />}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Badge status="processing" />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.pendingOrders} đơn chờ xử lý
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ ...statCardStyle, background: 'linear-gradient(135deg, #e6f4ff 0%, #fff 100%)' }}
            hoverable
          >
            <Statistic
              title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Sản phẩm</Text>}
              value={stats.products}
              valueStyle={{ color: '#1677ff', fontSize: 28, fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.categories} danh mục
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ ...statCardStyle, background: 'linear-gradient(135deg, #fffbe6 0%, #fff 100%)' }}
            hoverable
          >
            <Statistic
              title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Khách hàng</Text>}
              value={stats.users}
              valueStyle={{ color: '#d48806', fontSize: 28, fontWeight: 700 }}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Đã đăng ký
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Order Status Breakdown ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <SyncOutlined style={{ color: '#fa8c16' }} />
                <span>Phân bố trạng thái đơn hàng</span>
              </Space>
            }
            style={{ ...statCardStyle, height: '100%' }}
          >
            {stats.orders > 0 ? (
              <Row gutter={[16, 16]}>
                {Object.entries(statusMap).map(([key, val]) => {
                  const count = ordersByStatus[key] || 0
                  const percent = stats.orders > 0 ? Math.round((count / stats.orders) * 100) : 0
                  return (
                    <Col xs={12} sm={6} key={key}>
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Progress
                          type="circle"
                          percent={percent}
                          size={80}
                          strokeColor={
                            key === 'pending' ? '#faad14' :
                            key === 'shipping' ? '#1677ff' :
                            key === 'completed' ? '#52c41a' : '#ff4d4f'
                          }
                          format={() => (
                            <span style={{ fontSize: 20, fontWeight: 700 }}>{count}</span>
                          )}
                        />
                        <div style={{ marginTop: 8 }}>
                          <Tag icon={val.icon} color={val.color}>{val.label}</Tag>
                        </div>
                      </div>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                <div>Chưa có đơn hàng nào</div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: '#f5222d' }} />
                <span>Sản phẩm bán chạy</span>
              </Space>
            }
            style={{ ...statCardStyle, height: '100%' }}
          >
            {topProducts.length > 0 ? (
              <div>
                {topProducts.map((prod, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: index < topProducts.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <Space>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : index === 2 ? '#fadb14' : '#d9d9d9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: index < 3 ? '#fff' : '#8c8c8c',
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                      <Text ellipsis style={{ maxWidth: 180 }}>{prod.name}</Text>
                    </Space>
                    <Tag color="volcano">{prod.count} đã bán</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                <StarOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                <div>Chưa có dữ liệu</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Recent Orders Table ── */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            <span>Đơn hàng gần đây</span>
          </Space>
        }
        style={{ ...statCardStyle, marginTop: 24 }}
      >
        <Table
          columns={recentOrderColumns}
          dataSource={recentOrders}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Chưa có đơn hàng nào' }}
        />
      </Card>

      {/* ── Quick Summary ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#722ed1' }} />
                <span>Tóm tắt nhanh</span>
              </Space>
            }
            style={statCardStyle}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <span>
                      <Text strong>{stats.products}</Text> sản phẩm đang kinh doanh trong{' '}
                      <Text strong>{stats.categories}</Text> danh mục
                    </span>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <span>
                      <Text strong>{stats.orders}</Text> đơn hàng đã được tạo
                    </span>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <span>
                      <Text strong>{stats.pendingOrders}</Text> đơn hàng đang chờ xử lý
                    </span>
                  ),
                },
                {
                  color: 'red',
                  children: (
                    <span>
                      Tổng doanh thu:{' '}
                      <Text strong style={{ color: '#cf1322' }}>
                        {new Intl.NumberFormat('vi-VN').format(stats.revenue)}₫
                      </Text>
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>Hiệu suất</span>
              </Space>
            }
            style={statCardStyle}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Tỉ lệ hoàn thành đơn</Text>
                <Text strong>
                  {stats.orders > 0 ? Math.round((stats.completedOrders / stats.orders) * 100) : 0}%
                </Text>
              </div>
              <Progress
                percent={stats.orders > 0 ? Math.round((stats.completedOrders / stats.orders) * 100) : 0}
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Tỉ lệ hủy đơn</Text>
                <Text strong>
                  {stats.orders > 0 ? Math.round((stats.cancelledOrders / stats.orders) * 100) : 0}%
                </Text>
              </div>
              <Progress
                percent={stats.orders > 0 ? Math.round((stats.cancelledOrders / stats.orders) * 100) : 0}
                strokeColor="#ff4d4f"
                showInfo={false}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Đơn đang giao</Text>
                <Text strong>
                  {stats.orders > 0 ? Math.round(((stats.shippingOrders || 0) / stats.orders) * 100) : 0}%
                </Text>
              </div>
              <Progress
                percent={stats.orders > 0 ? Math.round(((stats.shippingOrders || 0) / stats.orders) * 100) : 0}
                strokeColor="#1677ff"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

```

- 4 stat cards: Doanh thu, Đơn hàng, Sản phẩm, Khách hàng (gradient backgrounds)
- Phân bố trạng thái đơn hàng (circular progress)
- Sản phẩm bán chạy (ranking list)
- Đơn hàng gần đây (table)
- Tóm tắt nhanh (timeline)
- Hiệu suất (progress bars: hoàn thành, hủy, đang giao)

---

### 4. AdminProductPage — Quản lý sản phẩm

```diff:AdminProductPage.jsx
import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api'

export default function AdminProductPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data?.data || data || [])
    } catch (err) {
      message.error('Lỗi tải danh sách sản phẩm')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ stock: 0, price: 0, featured: false })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      message.success('Đã xóa sản phẩm')
      loadData()
    } catch (err) {
      message.error('Lỗi khi xóa sản phẩm')
    }
  }

  const handleSave = async (values) => {
    try {
      if (editingId) {
        await updateProduct(editingId, values)
        message.success('Đã cập nhật sản phẩm')
      } else {
        const newProduct = {
          ...values,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString()
        }
        await createProduct(newProduct)
        message.success('Đã thêm sản phẩm mới')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      message.error('Lỗi khi lưu sản phẩm')
    }
  }

  const columns = [
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Mã SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand' },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      render: (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ'
    },
    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Đường dẫn tĩnh (Slug)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="Mã SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Tồn kho">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="featured" label="Nổi bật" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
===
import { useEffect, useState } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, InputNumber, Switch, 
  message, Popconfirm, Tag, Select, Card, Typography, Image, 
  Tooltip, Badge, Upload
} from 'antd'
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  ShoppingOutlined, ReloadOutlined, PictureOutlined,
  StarFilled, InboxOutlined
} from '@ant-design/icons'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../services/api'

const { Title, Text } = Typography
const { TextArea } = Input

export default function AdminProductPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodData, catData] = await Promise.all([
        getProducts(),
        getCategories()
      ])
      const prods = prodData?.data || prodData || []
      setProducts(prods)
      setFilteredProducts(prods)
      setCategories(catData || [])
    } catch (err) {
      message.error('Lỗi tải danh sách sản phẩm')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let result = [...products]
    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(lower) ||
        p.sku?.toLowerCase().includes(lower) ||
        p.brand?.toLowerCase().includes(lower)
      )
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.categoryId === categoryFilter)
    }
    setFilteredProducts(result)
  }, [searchText, categoryFilter, products])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ stock: 0, price: 0, featured: false })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      imageUrl: record.images?.[0] || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      message.success('Đã xóa sản phẩm')
      loadData()
    } catch (err) {
      message.error('Lỗi khi xóa sản phẩm')
    }
  }

  const handleSave = async (values) => {
    try {
      const { imageUrl, ...rest } = values
      const payload = {
        ...rest,
        images: imageUrl ? [imageUrl] : [],
      }

      if (editingId) {
        await updateProduct(editingId, payload)
        message.success('Đã cập nhật sản phẩm')
      } else {
        const newProduct = {
          ...payload,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          rating: 0,
          reviewCount: 0,
        }
        await createProduct(newProduct)
        message.success('Đã thêm sản phẩm mới')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      message.error('Lỗi khi lưu sản phẩm')
    }
  }

  const columns = [
    {
      title: 'Hình ảnh',
      key: 'image',
      width: 80,
      render: (_, record) => (
        record.images?.[0] ? (
          <Image
            src={record.images[0]}
            alt={record.name}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOzaFzfkNJwr4m"
          />
        ) : (
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 8,
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bfbfbf'
          }}>
            <PictureOutlined style={{ fontSize: 20 }} />
          </div>
        )
      ),
    },
    { 
      title: 'Tên sản phẩm', 
      dataIndex: 'name', 
      key: 'name',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          {record.featured && (
            <Tag color="gold" style={{ marginLeft: 8 }}>
              <StarFilled /> Nổi bật
            </Tag>
          )}
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.slug}</Text>
        </div>
      ),
    },
    { 
      title: 'SKU', 
      dataIndex: 'sku', 
      key: 'sku',
      width: 140,
      render: (sku) => <Text code>{sku}</Text>
    },
    { 
      title: 'Thương hiệu', 
      dataIndex: 'brand', 
      key: 'brand',
      width: 120,
      render: (brand) => brand ? <Tag color="blue">{brand}</Tag> : '-'
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'category',
      width: 140,
      render: (catId) => {
        const cat = categories.find(c => c.id === catId)
        return cat ? <Tag color="cyan">{cat.name}</Tag> : '-'
      },
    },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      width: 140,
      sorter: (a, b) => a.price - b.price,
      render: (val, record) => (
        <div>
          <Text strong style={{ color: '#cf1322' }}>
            {new Intl.NumberFormat('vi-VN').format(val)}₫
          </Text>
          {record.compareAtPrice && record.compareAtPrice > val && (
            <>
              <br />
              <Text delete type="secondary" style={{ fontSize: 12 }}>
                {new Intl.NumberFormat('vi-VN').format(record.compareAtPrice)}₫
              </Text>
            </>
          )}
        </div>
      ),
    },
    { 
      title: 'Tồn kho', 
      dataIndex: 'stock', 
      key: 'stock',
      width: 100,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock) => (
        <Badge 
          status={stock > 10 ? 'success' : stock > 0 ? 'warning' : 'error'} 
          text={
            <Text type={stock === 0 ? 'danger' : undefined}>
              {stock} {stock === 0 ? '(Hết hàng)' : ''}
            </Text>
          }
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="Chắc chắn xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <ShoppingOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0 }}>Quản lý Sản phẩm</Title>
          <Tag color="blue">{filteredProducts.length} sản phẩm</Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
        </Space>
      </div>

      <Card 
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên, SKU, thương hiệu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 180 }}
            options={[
              { label: 'Tất cả danh mục', value: 'all' },
              ...categories.map(c => ({ label: c.name, value: c.id }))
            ]}
          />
        </Space>

        <Table 
          columns={columns} 
          dataSource={filteredProducts} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            {editingId ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Nồi cơm điện Sharp 1.8L" />
          </Form.Item>
          
          <Space style={{ display: 'flex' }} size="middle">
            <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Vui lòng nhập slug' }]} style={{ flex: 1 }}>
              <Input placeholder="noi-com-dien-sharp-1-8l" />
            </Form.Item>
            <Form.Item name="sku" label="Mã SKU" rules={[{ required: true, message: 'Vui lòng nhập SKU' }]} style={{ flex: 1 }}>
              <Input placeholder="GD-RC-SHARP-001" />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} size="middle">
            <Form.Item name="brand" label="Thương hiệu" style={{ flex: 1 }}>
              <Input placeholder="Sharp" />
            </Form.Item>
            <Form.Item name="categoryId" label="Danh mục" style={{ flex: 1 }}>
              <Select
                placeholder="Chọn danh mục"
                options={categories.map(c => ({ label: c.name, value: c.id }))}
                allowClear
              />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} size="middle">
            <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: 'Vui lòng nhập giá' }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="1,690,000" />
            </Form.Item>
            <Form.Item name="compareAtPrice" label="Giá gốc (so sánh)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="2,000,000" />
            </Form.Item>
            <Form.Item name="stock" label="Tồn kho" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>

          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input placeholder="https://example.com/image.jpg" prefix={<PictureOutlined />} />
          </Form.Item>

          <Form.Item name="shortDescription" label="Mô tả ngắn">
            <TextArea rows={2} placeholder="Mô tả ngắn về sản phẩm..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={4} placeholder="Mô tả chi tiết sản phẩm..." />
          </Form.Item>

          <Form.Item name="featured" label="Sản phẩm nổi bật" valuePropName="checked">
            <Switch checkedChildren="Nổi bật" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

```

- Thumbnail hình ảnh sản phẩm
- Search theo tên, SKU, thương hiệu
- Filter theo danh mục
- Featured badge, giá gốc so sánh
- Stock status badges (còn hàng/sắp hết/hết hàng)
- Form tạo/sửa phong phú: category selector, image URL, mô tả ngắn/chi tiết

---

### 5. AdminCategoryPage — Quản lý danh mục

```diff:AdminCategoryPage.jsx
import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { apiFetch, createCategory, updateCategory, deleteCategory } from '../../services/api'

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/categories')
      setCategories(data)
    } catch (err) {
      message.error('Lỗi tải danh mục')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      message.success('Đã xóa danh mục')
      loadData()
    } catch (err) {
      message.error('Lỗi xóa danh mục')
    }
  }

  const handleSave = async (values) => {
    try {
      if (editingId) {
        await updateCategory(editingId, values)
        message.success('Cập nhật thành công')
      } else {
        const newCat = {
          ...values,
          id: `cat-${Date.now()}`
        }
        await createCategory(newCat)
        message.success('Thêm thành công')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      message.error('Lỗi lưu danh mục')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Danh mục</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
===
import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Card, Typography, Tooltip, Badge } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, AppstoreOutlined, SearchOutlined, ReloadOutlined, TagOutlined } from '@ant-design/icons'
import { apiFetch, createCategory, updateCategory, deleteCategory, getProducts } from '../../services/api'

const { Title, Text } = Typography

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [productCounts, setProductCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const [catData, prodData] = await Promise.all([
        apiFetch('/categories'),
        getProducts()
      ])
      const cats = catData || []
      const prods = prodData?.data || prodData || []
      
      // Count products per category
      const counts = {}
      prods.forEach(p => {
        if (p.categoryId) {
          counts[p.categoryId] = (counts[p.categoryId] || 0) + 1
        }
      })
      setProductCounts(counts)
      setCategories(cats)
      setFilteredCategories(cats)
    } catch (err) {
      message.error('Lỗi tải danh mục')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchText) {
      const lower = searchText.toLowerCase()
      setFilteredCategories(
        categories.filter(c =>
          c.name?.toLowerCase().includes(lower) ||
          c.slug?.toLowerCase().includes(lower)
        )
      )
    } else {
      setFilteredCategories(categories)
    }
  }, [searchText, categories])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (productCounts[id] > 0) {
      message.warning(`Danh mục này đang có ${productCounts[id]} sản phẩm. Vui lòng chuyển sản phẩm trước khi xóa.`)
      return
    }
    try {
      await deleteCategory(id)
      message.success('Đã xóa danh mục')
      loadData()
    } catch (err) {
      message.error('Lỗi xóa danh mục')
    }
  }

  const handleSave = async (values) => {
    try {
      // Auto-generate slug from name if not provided
      if (!values.slug && values.name) {
        values.slug = values.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      if (editingId) {
        await updateCategory(editingId, values)
        message.success('Cập nhật thành công')
      } else {
        const newCat = {
          ...values,
          id: `cat-${Date.now()}`
        }
        await createCategory(newCat)
        message.success('Thêm thành công')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      message.error('Lỗi lưu danh mục')
    }
  }

  // Auto-generate slug when name changes (only for new categories)
  const handleNameChange = (e) => {
    if (!editingId) {
      const name = e.target.value
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      form.setFieldsValue({ slug })
    }
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#f0f5ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          color: '#1677ff',
        }}>
          {index + 1}
        </div>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Text code style={{ fontSize: 12 }}>{id}</Text>
    },
    { 
      title: 'Tên danh mục', 
      dataIndex: 'name', 
      key: 'name',
      render: (name) => (
        <Space>
          <TagOutlined style={{ color: '#fa8c16' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    { 
      title: 'Slug', 
      dataIndex: 'slug', 
      key: 'slug',
      render: (slug) => <Tag color="geekblue">{slug}</Tag>
    },
    {
      title: 'Số sản phẩm',
      key: 'productCount',
      width: 130,
      render: (_, record) => {
        const count = productCounts[record.id] || 0
        return (
          <Badge
            count={count}
            showZero
            color={count > 0 ? '#1677ff' : '#d9d9d9'}
            overflowCount={999}
          />
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm 
            title="Xóa danh mục này?" 
            description={
              productCounts[record.id] > 0 
                ? `Danh mục này có ${productCounts[record.id]} sản phẩm.`
                : undefined
            }
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <AppstoreOutlined style={{ fontSize: 24, color: '#722ed1' }} />
          <Title level={3} style={{ margin: 0 }}>Quản lý Danh mục</Title>
          <Tag color="purple">{filteredCategories.length} danh mục</Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
        </Space>
      </div>

      <Card 
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
        </Space>

        <Table columns={columns} dataSource={filteredCategories} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={
          <Space>
            {editingId ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingId ? "Sửa danh mục" : "Thêm danh mục mới"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="VD: Nồi cơm điện" onChange={handleNameChange} />
          </Form.Item>
          <Form.Item 
            name="slug" 
            label="Slug (đường dẫn)" 
            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
            extra="Slug sẽ tự động tạo từ tên danh mục"
          >
            <Input placeholder="noi-com-dien" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

```

- Đếm số sản phẩm mỗi danh mục
- Auto-generate slug từ tên tiếng Việt
- Cảnh báo khi xóa danh mục có sản phẩm
- Search theo tên/slug

---

### 6. AdminOrderPage — Quản lý đơn hàng

```diff:AdminOrderPage.jsx
import { useEffect, useState } from 'react'
import { Table, Select, message, Tag } from 'antd'
import { getAllOrders, updateOrder } from '../../services/api'
import dayjs from 'dayjs'

const statusOptions = [
  { label: 'Chờ xử lý', value: 'pending', color: 'orange' },
  { label: 'Đang giao', value: 'shipping', color: 'blue' },
  { label: 'Hoàn thành', value: 'completed', color: 'green' },
  { label: 'Đã hủy', value: 'cancelled', color: 'red' },
]

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAllOrders()
      // Sort newest first
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (err) {
      message.error('Lỗi tải danh sách đơn hàng')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus })
      message.success('Đã cập nhật trạng thái đơn hàng')
      loadData()
    } catch (err) {
      message.error('Lỗi cập nhật đơn hàng')
    }
  }

  const columns = [
    { title: 'Mã ĐH', dataIndex: 'id', key: 'id' },
    { title: 'Khách hàng', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Số ĐT', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Ngày đặt', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'subtotal', 
      key: 'subtotal',
      render: (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const option = statusOptions.find(o => o.value === record.status)
        return (
          <Select 
            value={record.status} 
            onChange={(val) => handleStatusChange(record.id, val)}
            options={statusOptions}
            style={{ width: 130 }}
            dropdownMatchSelectWidth={false}
          />
        )
      }
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý Đơn hàng</h2>
      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} />
    </div>
  )
}
===
import { useEffect, useState } from 'react'
import { Table, Select, message, Tag, Input, Space, Card, Typography, Badge, Tooltip, Button, Popconfirm, Modal, Descriptions } from 'antd'
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  TruckOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ProfileOutlined,
  ReloadOutlined 
} from '@ant-design/icons'
import { getAllOrders, updateOrder, deleteOrder } from '../../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusOptions = [
  { label: 'Chờ xử lý', value: 'pending', color: 'orange', icon: <ClockCircleOutlined /> },
  { label: 'Đang giao', value: 'shipping', color: 'blue', icon: <TruckOutlined /> },
  { label: 'Hoàn thành', value: 'completed', color: 'green', icon: <CheckCircleOutlined /> },
  { label: 'Đã hủy', value: 'cancelled', color: 'red', icon: <CloseCircleOutlined /> },
]

const paymentMethodMap = {
  cod: { label: 'Tiền mặt (COD)', color: 'default' },
  bank: { label: 'Chuyển khoản', color: 'blue' },
  momo: { label: 'MoMo', color: 'magenta' },
}

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailModal, setDetailModal] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAllOrders()
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(sorted)
      setFilteredOrders(sorted)
    } catch (err) {
      message.error('Lỗi tải danh sách đơn hàng')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let result = [...orders]
    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(o =>
        o.fullName?.toLowerCase().includes(lower) ||
        o.phone?.includes(lower) ||
        o.id?.toLowerCase().includes(lower)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter)
    }
    setFilteredOrders(result)
  }, [searchText, statusFilter, orders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus })
      message.success('Đã cập nhật trạng thái đơn hàng')
      loadData()
    } catch (err) {
      message.error('Lỗi cập nhật đơn hàng')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId)
      message.success('Đã xóa đơn hàng')
      loadData()
    } catch (err) {
      message.error('Lỗi khi xóa đơn hàng')
    }
  }

  const columns = [
    {
      title: 'Mã ĐH',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id) => <Text code style={{ fontSize: 12 }}>{id?.slice(0, 10)}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format('HH:mm')}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 100,
      render: (_, record) => (
        <Badge count={record.items?.length || 0} color="#1677ff" showZero>
          <Tag>SP</Tag>
        </Badge>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 150,
      sorter: (a, b) => (a.subtotal || 0) - (b.subtotal || 0),
      render: (val) => (
        <Text strong style={{ color: '#cf1322' }}>
          {new Intl.NumberFormat('vi-VN').format(val)}₫
        </Text>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 130,
      render: (method) => {
        const pm = paymentMethodMap[method] || { label: method, color: 'default' }
        return <Tag color={pm.color}>{pm.label}</Tag>
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: 140 }}
          dropdownMatchSelectWidth={false}
          options={statusOptions.map(o => ({
            value: o.value,
            label: (
              <Space>
                {o.icon}
                <span>{o.label}</span>
              </Space>
            )
          }))}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setDetailModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đơn hàng này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteOrder(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  const expandedRowRender = (record) => {
    const itemColumns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'name',
        key: 'name',
        render: (name) => <Text strong>{name}</Text>
      },
      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
      { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand' },
      {
        title: 'Đơn giá',
        dataIndex: 'price',
        key: 'price',
        render: (val) => new Intl.NumberFormat('vi-VN').format(val) + '₫'
      },
      { title: 'SL', dataIndex: 'quantity', key: 'quantity' },
      {
        title: 'Thành tiền',
        key: 'total',
        render: (_, item) => (
          <Text strong style={{ color: '#cf1322' }}>
            {new Intl.NumberFormat('vi-VN').format(item.price * (item.quantity || 1))}₫
          </Text>
        ),
      },
    ]

    return (
      <div style={{ padding: '0 16px' }}>
        <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
          <Descriptions.Item label="Địa chỉ">{record.address}</Descriptions.Item>
          <Descriptions.Item label="Phương thức TT">
            {paymentMethodMap[record.paymentMethod]?.label || record.paymentMethod}
          </Descriptions.Item>
        </Descriptions>
        <Table
          columns={itemColumns}
          dataSource={record.items || []}
          rowKey={(item, idx) => item.id || idx}
          pagination={false}
          size="small"
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <ProfileOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
          <Title level={3} style={{ margin: 0 }}>Quản lý Đơn hàng</Title>
          <Tag color="blue">{filteredOrders.length} đơn</Tag>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
          Làm mới
        </Button>
      </div>

      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên, SĐT, mã đơn..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              ...statusOptions,
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.items?.length > 0,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <Space>
            <ProfileOutlined />
            <span>Chi tiết đơn hàng</span>
          </Space>
        }
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={700}
      >
        {detailModal && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng">{detailModal.id}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const s = statusOptions.find(o => o.value === detailModal.status)
                  return s ? <Tag icon={s.icon} color={s.color}>{s.label}</Tag> : detailModal.status
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{detailModal.fullName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{detailModal.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{detailModal.address}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(detailModal.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {paymentMethodMap[detailModal.paymentMethod]?.label || detailModal.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <Text strong style={{ color: '#cf1322', fontSize: 18 }}>
                  {new Intl.NumberFormat('vi-VN').format(detailModal.subtotal)}₫
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 20 }}>Sản phẩm</Title>
            <Table
              columns={[
                { title: 'Tên', dataIndex: 'name', key: 'name' },
                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫'
                },
                {
                  title: 'Thành tiền',
                  key: 'total',
                  render: (_, item) => (
                    <Text strong>
                      {new Intl.NumberFormat('vi-VN').format(item.price * (item.quantity || 1))}₫
                    </Text>
                  ),
                },
              ]}
              dataSource={detailModal.items || []}
              rowKey={(item, idx) => item.id || idx}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

```

- Search theo tên, SĐT, mã đơn
- Filter theo trạng thái (pending/shipping/completed/cancelled)
- Expandable rows hiển thị chi tiết items
- Modal xem chi tiết đơn hàng đầy đủ
- Nút xóa đơn hàng
- Icons cho trạng thái và phương thức thanh toán

---

### 7. AdminUserPage — Quản lý người dùng

```diff:AdminUserPage.jsx
===
import { useEffect, useState } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Typography, Tooltip, Badge, Avatar
} from 'antd'
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined, 
  SearchOutlined, ReloadOutlined, MailOutlined, PhoneOutlined,
  CrownOutlined, TeamOutlined
} from '@ant-design/icons'
import { getAllUsers, updateUser, deleteUser, register } from '../../services/api'

const { Title, Text } = Typography

export default function AdminUserPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (err) {
      message.error('Lỗi tải danh sách người dùng')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let result = [...users]
    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(u =>
        u.fullName?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower) ||
        u.phone?.includes(lower)
      )
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter)
    }
    setFilteredUsers(result)
  }, [searchText, roleFilter, users])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ role: 'customer' })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id)
    if (user?.role === 'admin') {
      message.warning('Không thể xóa tài khoản admin')
      return
    }
    try {
      await deleteUser(id)
      message.success('Đã xóa người dùng')
      loadData()
    } catch (err) {
      message.error('Lỗi khi xóa người dùng')
    }
  }

  const handleSave = async (values) => {
    try {
      if (editingId) {
        const { password, ...updateData } = values
        await updateUser(editingId, updateData)
        message.success('Đã cập nhật người dùng')
      } else {
        await register(values)
        message.success('Đã thêm người dùng mới')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      message.error(err.message || 'Lỗi khi lưu người dùng')
    }
  }

  const getAvatarColor = (name) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#eb2f96', '#52c41a']
    const index = (name?.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: getAvatarColor(record.fullName) }}
            icon={record.role === 'admin' ? <CrownOutlined /> : <UserOutlined />}
          >
            {record.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.fullName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => phone ? (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <Text>{phone}</Text>
        </Space>
      ) : <Text type="secondary">Chưa cập nhật</Text>
    },
    { 
      title: 'Vai trò', 
      dataIndex: 'role', 
      key: 'role',
      width: 140,
      render: (role) => (
        role === 'admin' ? (
          <Tag icon={<CrownOutlined />} color="red">Quản trị viên</Tag>
        ) : (
          <Tag icon={<UserOutlined />} color="blue">Khách hàng</Tag>
        )
      )
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id) => <Text code style={{ fontSize: 11 }}>{id}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          {record.role !== 'admin' ? (
            <Popconfirm title="Chắc chắn xóa người dùng này?" onConfirm={() => handleDelete(record.id)}>
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Không thể xóa admin">
              <Button type="text" icon={<DeleteOutlined />} disabled />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const adminCount = users.filter(u => u.role === 'admin').length
  const customerCount = users.filter(u => u.role === 'customer').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <TeamOutlined style={{ fontSize: 24, color: '#d48806' }} />
          <Title level={3} style={{ margin: 0 }}>Quản lý Người dùng</Title>
          <Tag color="orange">{filteredUsers.length} người dùng</Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Space size="middle" style={{ marginBottom: 20, display: 'flex' }}>
        <Card size="small" style={{ borderRadius: 10, minWidth: 160 }}>
          <Space>
            <Avatar style={{ backgroundColor: '#f56a00' }} icon={<CrownOutlined />} />
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Quản trị viên</Text>
              <div><Text strong style={{ fontSize: 20 }}>{adminCount}</Text></div>
            </div>
          </Space>
        </Card>
        <Card size="small" style={{ borderRadius: 10, minWidth: 160 }}>
          <Space>
            <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Khách hàng</Text>
              <div><Text strong style={{ fontSize: 20 }}>{customerCount}</Text></div>
            </div>
          </Space>
        </Card>
      </Space>

      <Card 
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên, email, SĐT..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 160 }}
            options={[
              { label: 'Tất cả vai trò', value: 'all' },
              { label: 'Quản trị viên', value: 'admin' },
              { label: 'Khách hàng', value: 'customer' },
            ]}
          />
        </Space>

        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="id" 
          loading={loading}
        />
      </Card>

      <Modal
        title={
          <Space>
            {editingId ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingId ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="fullName" label="Tên hiển thị" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" disabled={!!editingId} />
          </Form.Item>
          {!editingId && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="customer">
                <Space><UserOutlined /> Khách hàng</Space>
              </Select.Option>
              <Select.Option value="admin">
                <Space><CrownOutlined /> Quản trị viên</Space>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
```

- Avatar với màu tự động theo tên
- Summary cards: số admin vs khách hàng
- Search theo tên, email, SĐT
- Filter theo vai trò
- Bảo vệ không cho xóa tài khoản admin
- Icons cho email, phone, crown cho admin

## Verification

- ✅ Build thành công (`npm run build` — 803ms, no errors)
- ✅ Dev server chạy bình thường (`localhost:5173`)
- ✅ Mock API server chạy (`localhost:3001`)
- ✅ Đăng nhập admin account và truy cập `/admin` thành công
- ✅ Tất cả 5 trang admin hiển thị đúng dữ liệu

## Screenshots

````carousel
![Admin Dashboard - Tổng quan hệ thống](C:\Users\ADMIN\.gemini\antigravity\brain\1e10074b-4281-4b2b-b82a-88318e628f36\admin_dashboard_1777337304878.png)
<!-- slide -->
![Admin Products - Quản lý sản phẩm](C:\Users\ADMIN\.gemini\antigravity\brain\1e10074b-4281-4b2b-b82a-88318e628f36\admin_products_1777337322808.png)
<!-- slide -->
![Admin Orders - Quản lý đơn hàng](C:\Users\ADMIN\.gemini\antigravity\brain\1e10074b-4281-4b2b-b82a-88318e628f36\admin_orders_1777337340581.png)
<!-- slide -->
![Admin Users - Quản lý người dùng](C:\Users\ADMIN\.gemini\antigravity\brain\1e10074b-4281-4b2b-b82a-88318e628f36\admin_users_1777337359454.png)
````

## Đăng nhập Admin

- **URL**: `http://localhost:5173/tai-khoan/dang-nhap`
- **Email**: `admin@camvang.com`
- **Password**: `admin`
- **Admin Dashboard**: `http://localhost:5173/admin`
