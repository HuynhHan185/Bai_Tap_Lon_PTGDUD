import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/product/ProductCard'

function HomePage() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getProducts({ featured: true, _page: 1, _per_page: 8 }).then((r) => {
      setFeatured(r.data || r)
    })

    getCategories().then(setCategories)
  }, [])

  return (
    <section className="container home-page">
      <Helmet>
        <title>CamVang Home | Gia dụng cam vàng</title>
        <meta
          name="description"
          content="Cửa hàng đồ điện gia dụng với nồi cơm, nồi chiên, quạt, lò vi sóng và thiết bị bếp cho gia đình Việt."
        />
      </Helmet>

      <div className="hero">
        <div className="hero-main">
          <h1>Đồ điện gia dụng cho gia đình Việt</h1>
          <p>Màu sắc ấm, giá rõ ràng, giao nhanh, bảo hành minh bạch.</p>
          <Link to="/danh-muc/noi-com-dien" className="btn-primary">
            Mua ngay
          </Link>
        </div>

        <div className="hero-side">
  <Link
    to="/danh-muc/noi-chien-khong-dau"
    className="promo-card promo-card-air-fryer"
  >
    <span>Sale nồi chiên không dầu</span>
  </Link>

  <Link
    to="/danh-muc/quat-dien"
    className="promo-card promo-card-fan"
  >
    <span>Quạt điện cho mùa nóng</span>
  </Link>
</div>
      </div>

      <div className="category-strip">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/danh-muc/${cat.slug}`} className="chip">
            {cat.name}
          </Link>
        ))}
      </div>

      <section className="section-block">
        <div className="section-head">
          <h2>Sản phẩm nổi bật</h2>
          <Link to="/tim-kiem?q=">Xem tất cả</Link>
        </div>

        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </section>
  )
}

export default HomePage