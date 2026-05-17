import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Switch,
  message, Popconfirm, Tag, Select, Card, Typography, Image,
  Tooltip, Badge
} from 'antd'
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  ShoppingOutlined, ReloadOutlined, PictureOutlined,
  StarFilled
} from '@ant-design/icons'
import { getAdminProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../services/api'

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
        getAdminProducts(),
        getCategories()
      ])
      const prods = prodData || []
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
        (p.ten_sp || '').toLowerCase().includes(lower) ||
        (p.sku || '').toLowerCase().includes(lower) ||
        (p.brand || '').toLowerCase().includes(lower)
      )
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.ma_loai == categoryFilter)
    }
    setFilteredProducts(result)
  }, [searchText, categoryFilter, products])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ so_luong_ton: 0, don_gia: 0, featured: false, trang_thai: true })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.ma_sp)
    form.setFieldsValue({
      ten_sp: record.ten_sp,
      slug: record.slug,
      sku: record.sku,
      brand: record.brand,
      ma_loai: record.ma_loai,
      don_gia: record.don_gia,
      gia_goc: record.gia_goc,
      so_luong_ton: record.so_luong_ton,
      mo_ta_ngan: record.mo_ta_ngan,
      mo_ta_chi_tiet: record.mo_ta_chi_tiet,
      hinh_anh: record.hinh_anh,
      featured: !!record.featured,
      trang_thai: record.trang_thai === 1,
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
      if (editingId) {
        await updateProduct(editingId, values)
        message.success('Đã cập nhật sản phẩm')
      } else {
        await createProduct(values)
        message.success('Đã thêm sản phẩm mới')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      message.error(err.message || 'Lỗi khi lưu sản phẩm')
    }
  }

  const columns = [
    {
      title: 'Hình ảnh',
      key: 'image',
      width: 80,
      render: (_, record) => (
        record.hinh_anh ? (
          <Image
            src={record.hinh_anh}
            alt={record.ten_sp}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOzaFzfkNJwr4j"
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
      key: 'ten_sp',
      render: (_, record) => (
        <div>
          <Text strong>{record.ten_sp}</Text>
          {record.featured == 1 && (
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
      key: 'danh_muc',
      width: 140,
      render: (_, record) => {
        const cat = categories.find(c => c.ma_loai === record.ma_loai)
        return cat ? <Tag color="cyan">{cat.ten_loai}</Tag> : '-'
      },
    },
    {
      title: 'Giá',
      dataIndex: 'don_gia',
      key: 'don_gia',
      width: 140,
      sorter: (a, b) => (a.don_gia || 0) - (b.don_gia || 0),
      render: (val, record) => (
        <div>
          <Text strong style={{ color: '#cf1322' }}>
            {new Intl.NumberFormat('vi-VN').format(val || 0)}₫
          </Text>
          {record.gia_goc && record.gia_goc > val && (
            <>
              <br />
              <Text delete type="secondary" style={{ fontSize: 12 }}>
                {new Intl.NumberFormat('vi-VN').format(record.gia_goc)}₫
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'so_luong_ton',
      key: 'so_luong_ton',
      width: 100,
      sorter: (a, b) => (a.so_luong_ton || 0) - (b.so_luong_ton || 0),
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
          <Popconfirm title="Chắc chắn xóa sản phẩm này?" onConfirm={() => handleDelete(record.ma_sp)}>
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
              ...categories.map(c => ({ label: c.ten_loai, value: c.ma_loai }))
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="ma_sp"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} sản phẩm`,
          }}
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
          <Form.Item name="ten_sp" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
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
            <Form.Item name="ma_loai" label="Danh mục" style={{ flex: 1 }}>
              <Select
                placeholder="Chọn danh mục"
                options={categories.map(c => ({ label: c.ten_loai, value: c.ma_loai }))}
                allowClear
              />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} size="middle">
            <Form.Item name="don_gia" label="Giá bán" rules={[{ required: true, message: 'Vui lòng nhập giá' }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="1,690,000" />
            </Form.Item>
            <Form.Item name="gia_goc" label="Giá gốc" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="2,000,000" />
            </Form.Item>
            <Form.Item name="so_luong_ton" label="Tồn kho" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>

          <Form.Item name="hinh_anh" label="URL hình ảnh">
            <Input placeholder="https://example.com/image.jpg" prefix={<PictureOutlined />} />
          </Form.Item>

          <Form.Item name="mo_ta_ngan" label="Mô tả ngắn">
            <TextArea rows={2} placeholder="Mô tả ngắn về sản phẩm..." />
          </Form.Item>

          <Form.Item name="mo_ta_chi_tiet" label="Mô tả chi tiết">
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
