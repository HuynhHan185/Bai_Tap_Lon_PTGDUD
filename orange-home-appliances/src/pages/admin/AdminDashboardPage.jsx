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
