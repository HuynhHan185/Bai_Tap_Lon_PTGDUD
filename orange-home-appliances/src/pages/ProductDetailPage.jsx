import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import Breadcrumbs from '../components/common/Breadcrumbs'
import ProductCard from '../components/product/ProductCard'
import ProductGallery from '../components/product/ProductGallery'
import ProductTabs from '../components/product/ProductTabs'
import { addToCart } from '../features/cart/cartSlice'
import { getProductBySlug, getProducts } from '../services/api'
import { formatCurrency } from '../utils/currency'

function ProductDetailPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)

  useEffect(() => {
    async function fetchProduct() {
      const data = await getProductBySlug(slug)
      setProduct(data)

      if (data?.categorySlug) {
        const relatedData = await getProducts({
          categorySlug: data.categorySlug,
        })

        setRelated(
          (relatedData.data || relatedData)
            .filter((item) => item.slug !== data.slug)
            .slice(0, 4),
        )
      }
    }

    fetchProduct()
  }, [slug])

  if (!product) {
    return <section className="container">Đang tải sản phẩm...</section>
  }

  function handleAddToCart() {
    dispatch(addToCart({ ...product, quantity: qty }))
  }

  function handleBuyNow() {
    dispatch(addToCart({ ...product, quantity: qty }))
    navigate('/gio-hang')
  }

  return (
    <section className="container detail-page">
      <Helmet>
        <title>{product.name} | CamVang Home</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>

      <Breadcrumbs
        items={[
          { label: 'Sản phẩm', to: '/tim-kiem' },
          { label: product.name },
        ]}
      />

      <div className="detail-grid">
        <ProductGallery product={product} />

        <div className="summary">
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>

          <p className="product-meta">
            SKU: {product.sku} · Còn {product.stock} sản phẩm · {product.rating}/5 sao
          </p>

          <div className="price-large">
            <strong>{formatCurrency(product.price)}</strong>
            {product.compareAtPrice && (
              <span>{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>

          <p>{product.shortDescription}</p>

          <div className="qty-row">
            <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))}>
              -
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((value) => value + 1)}>
              +
            </button>
          </div>

          <div className="action-row">
            <button className="btn-primary" type="button" onClick={handleAddToCart}>
              Thêm vào giỏ
            </button>

            <button className="btn-secondary" type="button" onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      <section className="section-block">
        <h2>Sản phẩm tương tự</h2>

        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </section>
  )
}

export default ProductDetailPage