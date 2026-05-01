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
  const priceRange = searchParams.get('priceRange') || ''
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [productList, categoryList] = await Promise.all([
          getProducts({ category: slug || undefined }),
          getCategories(),
        ])

        setProducts(productList.products || [])
        setCategories(categoryList)
      } catch (err) {
        console.error('Error loading data:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const currentCategory = categories.find((category) => category.slug === slug)

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (q) {
      result = result.filter((product) =>
        product.ten_sp?.toLowerCase().includes(q.toLowerCase()),
      )
    }

    if (brand) {
      result = result.filter((product) =>
        product.brand?.toLowerCase().includes(brand.toLowerCase()),
      )
    }

    if (stock === 'in-stock') {
      result = result.filter((product) => product.so_luong_ton > 0)
    }

    if (priceRange) {
      const rangeMap = {
        under_500k: [0, 500000],
        '500k_1m': [500000, 1000000],
        '1m_2m': [1000000, 2000000],
        above_2m: [2000000, Infinity],
      }
      const [min, max] = rangeMap[priceRange] || [0, Infinity]
      result = result.filter((product) => product.don_gia >= min && product.don_gia < max)
    }

    if (sort === 'price') {
      result.sort((a, b) => a.don_gia - b.don_gia)
    }

    if (sort === '-price') {
      result.sort((a, b) => b.don_gia - a.don_gia)
    }

    if (sort === 'name') {
      result.sort((a, b) => (a.ten_sp || '').localeCompare(b.ten_sp || ''))
    }

    if (sort === '-createdAt' || sort === 'created_desc') {
      result.sort((a, b) => new Date(b.ngay_tao || 0) - new Date(a.ngay_tao || 0))
    }

    return result
  }, [products, q, brand, stock, priceRange, sort])

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
          {currentCategory?.ten_loai || q ? 'Tìm kiếm sản phẩm' : 'Danh mục sản phẩm'} | CamVang Home
        </title>
      </Helmet>

      <Breadcrumbs
        items={[
          {
            label: currentCategory?.ten_loai || 'Sản phẩm',
          },
        ]}
      />

      <div className="category-title">
        <h1>{currentCategory?.ten_loai || 'Tất cả sản phẩm'}</h1>
        {q && <p>Kết quả tìm kiếm cho: "{q}"</p>}
      </div>

      <div className="category-layout">
        <FilterDrawer
          categories={categories}
          currentCategory={currentCategory}
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
                  <ProductCard key={product.ma_sp} product={product} />
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
