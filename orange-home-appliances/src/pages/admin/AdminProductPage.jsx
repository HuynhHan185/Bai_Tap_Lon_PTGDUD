import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api'

export default function AdminProductPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data?.data || data || [])
    } catch (err) {
      message.error('Lỗi tải danh sách sản phẩm')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ stock: 0, price: 0, featured: false })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
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
        const newProduct = {
          ...values,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString()
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
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Mã SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand' },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      render: (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ'
    },
    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Đường dẫn tĩnh (Slug)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="Mã SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Tồn kho">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="featured" label="Nổi bật" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
