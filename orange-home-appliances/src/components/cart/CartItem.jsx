import { useDispatch } from 'react-redux'

import {
  removeFromCart,
  updateQty,
} from '../../features/cart/cartSlice'
import { formatCurrency } from '../../utils/currency'

function CartItem({ item }) {
  const dispatch = useDispatch()
  const image = item.images?.[0] || item.image

  return (
    <article className="cart-item">
      <img src={image} alt={item.name} />

      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <p className="cart-item-sku">SKU: {item.sku}</p>
        <p className="cart-item-price">{formatCurrency(item.price)}</p>

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
        {formatCurrency(item.price * item.quantity)}
      </strong>
    </article>
  )
}

export default CartItem