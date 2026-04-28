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
