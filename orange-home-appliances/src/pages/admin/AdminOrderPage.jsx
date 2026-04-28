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
