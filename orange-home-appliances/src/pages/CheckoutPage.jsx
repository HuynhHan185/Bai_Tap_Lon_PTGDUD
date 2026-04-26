import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'

import {
  clearCart,
  selectCartItems,
  selectCartSubtotal,
} from '../features/cart/cartSlice'
import { createOrder } from '../services/api'

const schema = z.object({
  fullName: z.string().min(2, 'Nhập họ tên'),
  phone: z.string().min(9, 'Nhập số điện thoại'),
  address: z.string().min(10, 'Nhập địa chỉ'),
  paymentMethod: z.enum(['cod', 'bank', 'momo']),
})

const money = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

function CheckoutPage() {
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: 'cod',
    },
  })

  async function onSubmit(values) {
    await createOrder({
      ...values,
      items,
      subtotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    dispatch(clearCart())
    alert('Đặt hàng thành công.')
    window.location.href = '/'
  }

  return (
    <section className="container checkout-page">
      <Helmet>
        <title>Thanh toán | CamVang Home</title>
      </Helmet>

      <div className="checkout-grid">
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
          <label>
            Họ và tên
            <input {...register('fullName')} />
            {errors.fullName && <small>{errors.fullName.message}</small>}
          </label>

          <label>
            Số điện thoại
            <input {...register('phone')} />
            {errors.phone && <small>{errors.phone.message}</small>}
          </label>

          <label>
            Địa chỉ
            <textarea {...register('address')} rows={4} />
            {errors.address && <small>{errors.address.message}</small>}
          </label>

          <fieldset>
            <legend>Phương thức thanh toán</legend>

            <label>
              <input type="radio" value="cod" {...register('paymentMethod')} />
              COD
            </label>

            <label>
              <input type="radio" value="bank" {...register('paymentMethod')} />
              Chuyển khoản
            </label>

            <label>
              <input type="radio" value="momo" {...register('paymentMethod')} />
              Ví điện tử
            </label>
          </fieldset>

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            Xác nhận đặt hàng
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Đơn hàng</h2>

          {items.map((item) => (
            <p key={item.id}>
              {item.name} × {item.quantity}
            </p>
          ))}

          <p>
            <strong>Tạm tính: {money(subtotal)}</strong>
          </p>
        </aside>
      </div>
    </section>
  )
}

export default CheckoutPage