import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

import CartItem from '../components/cart/CartItem'
import {
  selectCartItems,
  selectCartSubtotal,
} from '../features/cart/cartSlice'
import { formatCurrency } from '../utils/currency'

function CartPage() {
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const shippingFee = subtotal >= 2000000 ? 0 : 30000
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <section className="container empty-state">
        <h1>Giỏ hàng trống</h1>
        <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link to="/tim-kiem" className="btn-primary">
          Tiếp tục mua sắm
        </Link>
      </section>
    )
  }

  return (
    <section className="container cart-page">
      <h1>Giỏ hàng</h1>

      <div className="cart-grid">
        <div className="cart-list">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>

          <div className="summary-row">
            <span>Tạm tính</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <strong>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</strong>
          </div>

          <div className="summary-row total">
            <span>Tổng cộng</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <Link to="/thanh-toan" className="btn-primary">
            Tiếp tục thanh toán
          </Link>
        </aside>
      </div>
    </section>
  )
}

export default CartPage