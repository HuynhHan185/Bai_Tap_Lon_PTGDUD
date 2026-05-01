import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/product/ProductCard'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [openCategories, setOpenCategories] = useState({})
  const [allProducts, setAllProducts] = useState({}) // catSlug -> products[]

  useEffect(() => {
    getCategories().then(async (cats) => {
      setCategories(cats)
      // Open first 5 categories by default
      const initial = {}
      cats.slice(0, 5).forEach((c) => { initial[c.slug] = true })
      setOpenCategories(initial)

      // Fetch products for each category (limit 4 per category)
      const results = {}
      await Promise.all(
        cats.map(async (cat) => {
          try {
            const data = await getProducts({ category: cat.slug, page: 1, limit: 4 })
            results[cat.slug] = data.products || []
          } catch {
            results[cat.slug] = []
          }
        })
      )
      setAllProducts(results)
    }).catch(() => {})
  }, [])

  const toggleCategory = (slug) => {
    setOpenCategories((prev) => ({ ...prev, [slug]: !prev[slug] }))
  }

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

      {/* Products grouped by category — collapsible sections */}
      <div className="category-sections">
        {categories.map((cat) => {
          const isOpen = !!openCategories[cat.slug]
          const products = allProducts[cat.slug] || []

          return (
            <div key={cat.slug} className="category-section">
              <button
                type="button"
                className="category-section-header"
                onClick={() => toggleCategory(cat.slug)}
                aria-expanded={isOpen}
              >
                <div className="category-section-title">
                  <h2>{cat.ten_loai}</h2>
                </div>
                <span className={`category-section-chevron ${isOpen ? 'is-open' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 8L10 13L15 8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="category-section-body">
                  {products.length > 0 ? (
                    <div className="product-grid">
                      {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  ) : (
                    <p className="category-section-empty">Không có sản phẩm nào.</p>
                  )}
                  <div className="category-section-footer">
                    <Link to={`/danh-muc/${cat.slug}`} className="btn-secondary">
                      Xem tất cả {cat.ten_loai}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HomePage
