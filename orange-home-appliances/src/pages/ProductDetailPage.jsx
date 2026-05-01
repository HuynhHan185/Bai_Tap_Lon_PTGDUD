import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import Breadcrumbs from '../components/common/Breadcrumbs'
import ProductCard from '../components/product/ProductCard'
import ProductGallery from '../components/product/ProductGallery'
import ProductTabs from '../components/product/ProductTabs'
import { addToCart } from '../features/cart/cartSlice'
import { getProductBySlug, getRelatedProducts } from '../services/api'
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
      try {
        const data = await getProductBySlug(slug)
        setProduct(data)

        if (data?.ma_sp) {
          const relatedData = await getRelatedProducts(data.ma_sp)
          setRelated((relatedData.products || []).filter((item) => item.slug !== slug).slice(0, 4))
        }
      } catch (err) {
        console.error('Error loading product:', err)
      }
    }

    fetchProduct()
  }, [slug])

  if (!product) {
    return <section className="container"><p>Đang tải sản phẩm...</p></section>
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
        <title>{product.ten_sp} | CamVang Home</title>
        <meta name="description" content={product.mo_ta_ngan} />
      </Helmet>

      <Breadcrumbs
        items={[
          { label: 'Sản phẩm', to: '/tim-kiem' },
          { label: product.ten_sp },
        ]}
      />

      <div className="detail-grid">
        <ProductGallery product={product} />

        <div className="summary">
          <p className="product-brand">{product.brand}</p>
          <h1>{product.ten_sp}</h1>

          <p className="product-meta">
            SKU: {product.sku} · Còn {product.so_luong_ton} sản phẩm
          </p>

          <div className="price-large">
            <strong>{formatCurrency(product.don_gia)}</strong>
            {product.gia_goc && product.gia_goc > product.don_gia && (
              <span>{formatCurrency(product.gia_goc)}</span>
            )}
          </div>

          <p>{product.mo_ta_ngan}</p>

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
            <ProductCard key={item.ma_sp} product={item} />
          ))}
        </div>
      </section>
    </section>
  )
}

export default ProductDetailPage
