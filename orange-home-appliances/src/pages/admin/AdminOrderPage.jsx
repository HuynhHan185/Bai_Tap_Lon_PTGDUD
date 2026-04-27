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
