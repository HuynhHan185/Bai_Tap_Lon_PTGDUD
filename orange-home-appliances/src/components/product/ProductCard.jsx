import { Link } from 'react-router-dom'

const money = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

function ProductCard({ product }) {
  const name = product.ten_sp
  const price = product.don_gia
  const stock = product.so_luong_ton
  const categoryName = product.ten_loai
  const sku = product.sku
  const slug = product.slug || product.category_slug

  const images = (() => {
    if (product.hinh_anh_list) {
      try {
        return typeof product.hinh_anh_list === 'string'
          ? JSON.parse(product.hinh_anh_list)
          : product.hinh_anh_list
      } catch {
        return []
      }
    }
    return []
  })()
  const mainImage = product.hinh_anh || images[0] || 'https://placehold.co/400x400?text=No+Image'

  return (
    <article className="product-card">
      <Link to={`/san-pham/${slug}`} className="thumb">
        <img src={mainImage} alt={name} />
      </Link>

      <div className="product-body">
        <p className="product-brand">{categoryName}</p>

        <h3>
          <Link to={`/san-pham/${slug}`}>{name}</Link>
        </h3>

        <p className="product-meta">
          SKU: {sku} · Còn {stock}
        </p>

        <div className="product-price-row">
          <strong>{money(price)}</strong>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
