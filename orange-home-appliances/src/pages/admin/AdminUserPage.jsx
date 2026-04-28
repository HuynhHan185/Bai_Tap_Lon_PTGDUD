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
