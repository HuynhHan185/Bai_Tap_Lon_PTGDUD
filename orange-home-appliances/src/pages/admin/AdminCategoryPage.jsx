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
