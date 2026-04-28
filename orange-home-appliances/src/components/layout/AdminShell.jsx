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
