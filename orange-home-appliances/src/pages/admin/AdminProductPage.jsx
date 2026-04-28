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
