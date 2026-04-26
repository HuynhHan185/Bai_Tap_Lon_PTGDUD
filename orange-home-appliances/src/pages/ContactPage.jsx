import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { createContact } from '../services/api'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(3, 'Nhập chủ đề'),
  message: z.string().min(10, 'Nhập nội dung'),
  phone: z.string().optional(),
})

function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values) {
    await createContact({
      ...values,
      createdAt: new Date().toISOString(),
    })

    alert('Đã gửi liên hệ.')
  }

  return (
    <section className="container contact-page">
      <Helmet>
        <title>Liên hệ | CamVang Home</title>
      </Helmet>

      <div className="contact-grid">
        <div>
          <h1>Liên hệ hỗ trợ</h1>
          <p>Hotline: 1900 0000</p>
          <p>Zalo OA: CamVang Home</p>
          <p>Email: support@camvang.test</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input {...register('email')} />
          </label>
          {errors.email && <small>{errors.email.message}</small>}

          <label>
            Số điện thoại
            <input {...register('phone')} />
          </label>

          <label>
            Chủ đề
            <input {...register('subject')} />
          </label>
          {errors.subject && <small>{errors.subject.message}</small>}

          <label>
            Nội dung
            <textarea rows={5} {...register('message')} />
          </label>
          {errors.message && <small>{errors.message.message}</small>}

          <button className="btn-primary" disabled={isSubmitting}>
            Gửi tin nhắn
          </button>
        </form>
      </div>
    </section>
  )
}

export default ContactPage