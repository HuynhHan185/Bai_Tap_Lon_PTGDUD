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
import { getAllOrders, updateOrderStatus, deleteOrder, getOrderDetail } from '../../services/api'
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
  const [detailLoading, setDetailLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const resp = await getAllOrders()
      const list = resp?.orders || resp || []
      const sorted = [...list].sort((a, b) => new Date(b.ngay_tao) - new Date(a.ngay_tao))
      setOrders(sorted)
      setFilteredOrders(sorted)
    } catch (err) {
      message.error('Lỗi tải danh sách đơn hàng')
    }
    setLoading(false)
  }

  const handleViewDetail = async (record) => {
    setDetailLoading(true)
    try {
      const resp = await getOrderDetail(record.ma_don_hang)
      setDetailModal(resp.order || resp)
    } catch {
      setDetailModal(record)
    }
    setDetailLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let result = [...orders]
    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(o =>
        ([o.ho, o.ten].filter(Boolean).join(' '))?.toLowerCase().includes(lower) ||
        o.so_dien_thoai?.includes(lower) ||
        o.ma_don_hang?.toLowerCase().includes(lower)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.trang_thai === statusFilter)
    }
    setFilteredOrders(result)
  }, [searchText, statusFilter, orders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { trang_thai: newStatus })
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
      dataIndex: 'ma_don_hang',
      key: 'ma_don_hang',
      width: 130,
      render: (id) => <Text code style={{ fontSize: 12 }}>{id?.slice(0, 10)}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'ho',
      key: 'ho',
      render: (_, record) => (
        <div>
          <Text strong>{[record.ho, record.ten].filter(Boolean).join(' ')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.so_dien_thoai}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'ngay_tao',
      key: 'ngay_tao',
      width: 150,
      sorter: (a, b) => new Date(a.ngay_tao) - new Date(b.ngay_tao),
      render: (date) => (
        <Tooltip title={date ? new Date(date).toLocaleString('vi-VN') : ''}>
          <Text>{date ? new Date(date).toLocaleDateString('vi-VN') : ''}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 100,
      render: (_, record) => (
        <Badge count={record.so_san_pham || 0} color="#1677ff" showZero>
          <Tag>SP</Tag>
        </Badge>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'thanh_tien',
      key: 'thanh_tien',
      width: 150,
      sorter: (a, b) => (a.thanh_tien || 0) - (b.thanh_tien || 0),
      render: (val) => (
        <Text strong style={{ color: '#cf1322' }}>
          {new Intl.NumberFormat('vi-VN').format(val || 0)}₫
        </Text>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'phuong_thuc_thanh_toan',
      key: 'phuong_thuc_thanh_toan',
      width: 130,
      render: (method) => {
        const pm = paymentMethodMap[method] || { label: method, color: 'default' }
        return <Tag color={pm.color}>{pm.label}</Tag>
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      width: 150,
      render: (_, record) => {
        const opt = statusOptions.find(o => o.value === record.trang_thai)
        return (
          <Select
            value={record.trang_thai}
            onChange={(val) => handleStatusChange(record.ma_don_hang, val)}
            style={{ width: 140 }}
            dropdownMatchSelectWidth={false}
            options={statusOptions.map(o => ({
              value: o.value,
              label: <Space>{o.icon}<span>{o.label}</span></Space>
            }))}
          />
        )
      }
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
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đơn hàng này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteOrder(record.ma_don_hang)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: '0 16px' }}>
        <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
          <Descriptions.Item label="Địa chỉ">{record.dia_chi}</Descriptions.Item>
          <Descriptions.Item label="Phương thức TT">
            {paymentMethodMap[record.phuong_thuc_thanh_toan]?.label || record.phuong_thuc_thanh_toan}
          </Descriptions.Item>
          <Descriptions.Item label="Số sản phẩm">{record.so_san_pham}</Descriptions.Item>
        </Descriptions>
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
          rowKey="ma_don_hang"
          loading={loading}
          expandable={{
            expandedRowRender,
            rowExpandable: () => false,
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
        loading={detailLoading}
      >
        {detailModal && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng">{detailModal.ma_don_hang}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const s = statusOptions.find(o => o.value === detailModal.trang_thai)
                  return s ? <Tag icon={s.icon} color={s.color}>{s.label}</Tag> : detailModal.trang_thai
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{[detailModal.ho, detailModal.ten].filter(Boolean).join(' ')}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{detailModal.so_dien_thoai}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{detailModal.dia_chi}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(detailModal.ngay_tao).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {paymentMethodMap[detailModal.phuong_thuc_thanh_toan]?.label || detailModal.phuong_thuc_thanh_toan}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <Text strong style={{ color: '#cf1322', fontSize: 18 }}>
                  {new Intl.NumberFormat('vi-VN').format(detailModal.thanh_tien)}₫
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 20 }}>Sản phẩm</Title>
            <Table
              columns={[
                { title: 'Tên', dataIndex: 'ten_sp', key: 'ten_sp' },
                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                { title: 'SL', dataIndex: 'so_luong', key: 'so_luong', width: 60 },
                {
                  title: 'Đơn giá',
                  dataIndex: 'don_gia',
                  key: 'don_gia',
                  render: (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫'
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'thanh_tien',
                  key: 'thanh_tien',
                  render: (v) => (
                    <Text strong style={{ color: '#cf1322' }}>
                      {new Intl.NumberFormat('vi-VN').format(v)}₫
                    </Text>
                  ),
                },
              ]}
              dataSource={detailModal.items || []}
              rowKey={(item, idx) => item.ma_sp || idx}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
