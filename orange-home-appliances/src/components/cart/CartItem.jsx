import { useDispatch } from 'react-redux'

import {
  removeFromCart,
  updateQty,
} from '../../features/cart/cartSlice'
import { formatCurrency } from '../../utils/currency'

function CartItem({ item }) {
  const dispatch = useDispatch()

  const image = item.image || item.hinh_anh || null
  const name = item.name || item.ten_sp || 'Sản phẩm'
  const price = item.price || item.don_gia || 0

  return (
    <article className="cart-item">
      <img
        src={image || 'https://placehold.co/100x100?text=No+Image'}
        alt={name}
      />

      <div className="cart-item-info">
        <h3>{name}</h3>
        <p className="cart-item-sku">SKU: {item.sku || 'N/A'}</p>
        <p className="cart-item-price">{formatCurrency(price)}</p>

        <div className="qty-row">
          <button
            type="button"
            onClick={() =>
              dispatch(updateQty({ id: item.id, quantity: item.quantity - 1 }))
            }
          >
            -
          </button>

          <span>{item.quantity}</span>

          <button
            type="button"
            onClick={() =>
              dispatch(updateQty({ id: item.id, quantity: item.quantity + 1 }))
            }
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => dispatch(removeFromCart(item.id))}
        >
          Xóa sản phẩm
        </button>
      </div>

      <strong className="cart-item-total">
        {formatCurrency(price * item.quantity)}
      </strong>
    </article>
  )
}

export default CartItem
