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
