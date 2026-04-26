import { Link } from 'react-router-dom'

const money = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/san-pham/${product.slug}`} className="thumb">
        <img src={product.images?.[0]} alt={product.name} />
      </Link>

      <div className="product-body">
        <p className="product-brand">{product.brand}</p>

        <h3>
          <Link to={`/san-pham/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="product-meta">
          SKU: {product.sku} · Còn {product.stock}
        </p>

        <div className="product-price-row">
          <strong>{money(product.price)}</strong>

          {product.compareAtPrice ? (
            <span>{money(product.compareAtPrice)}</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default ProductCard