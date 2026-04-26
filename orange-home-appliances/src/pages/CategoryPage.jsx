import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useSearchParams } from 'react-router-dom'

import Breadcrumbs from '../components/common/Breadcrumbs'
import Pagination from '../components/common/Pagination'
import FilterDrawer from '../components/filters/FilterDrawer'
import SortBar from '../components/filters/SortBar'
import ProductCard from '../components/product/ProductCard'
import { getCategories, getProducts } from '../services/api'

const PAGE_SIZE = 8

function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const q = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const brand = searchParams.get('brand') || ''
  const stock = searchParams.get('stock') || ''
  const minPrice = Number(searchParams.get('minPrice') || 0)
  const maxPrice = Number(searchParams.get('maxPrice') || 0)
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [productList, categoryList] = await Promise.all([
          getProducts(),
          getCategories(),
        ])

        setProducts(productList.data || productList)
        setCategories(categoryList)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const currentCategory = categories.find((category) => category.slug === slug)

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (slug) {
      result = result.filter((product) => product.categorySlug === slug)
    }

    if (q) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(q.toLowerCase()),
      )
    }

    if (brand) {
      result = result.filter((product) =>
        product.brand.toLowerCase().includes(brand.toLowerCase()),
      )
    }

    if (stock === 'in-stock') {
      result = result.filter((product) => product.stock > 0)
    }

    if (minPrice > 0) {
      result = result.filter((product) => product.price >= minPrice)
    }

    if (maxPrice > 0) {
      result = result.filter((product) => product.price <= maxPrice)
    }

    if (sort === 'price') {
      result.sort((a, b) => a.price - b.price)
    }

    if (sort === '-price') {
      result.sort((a, b) => b.price - a.price)
    }

    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sort === '-createdAt') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return result
  }, [products, slug, q, brand, stock, minPrice, maxPrice, sort])

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  function handlePageChange(nextPage) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(nextPage))
    setSearchParams(nextParams)
  }

  return (
    <section className="container category-page">
      <Helmet>
        <title>
          {currentCategory?.name || q ? 'Tìm kiếm sản phẩm' : 'Danh mục sản phẩm'} | CamVang Home
        </title>
      </Helmet>

      <Breadcrumbs
        items={[
          {
            label: currentCategory?.name || 'Sản phẩm',
          },
        ]}
      />

      <div className="category-title">
        <h1>{currentCategory?.name || 'Tất cả sản phẩm'}</h1>
        {q && <p>Kết quả tìm kiếm cho: "{q}"</p>}
      </div>

      <div className="category-layout">
        <FilterDrawer
          categories={categories}
          currentCategory={currentCategory?.name}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        <div>
          <SortBar
            total={filteredProducts.length}
            onOpenFilter={() => setFilterOpen(true)}
          />

          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : (
            <>
              <div className="product-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {paginatedProducts.length === 0 && (
                <div className="empty-state">
                  <h2>Không tìm thấy sản phẩm</h2>
                  <p>Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
                </div>
              )}

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default CategoryPage