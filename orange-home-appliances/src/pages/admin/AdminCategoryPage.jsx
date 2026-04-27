import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { apiFetch, createCategory, updateCategory, deleteCategory } from '../../services/api'

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/categories')
      setCategories(data)
    } catch (err) {
      message.error('Lỗi tải danh mục')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

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

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Danh mục</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
