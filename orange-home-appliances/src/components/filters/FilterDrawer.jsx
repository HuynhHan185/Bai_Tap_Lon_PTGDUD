import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getBrands } from '../../services/api'

const PRICE_RANGES = [
  { value: 'under_500k', label: 'Dưới 500.000 đ', min: 0, max: 500000 },
  { value: '500k_1m', label: '500.000 đ - 1.000.000 đ', min: 500000, max: 1000000 },
  { value: '1m_2m', label: '1.000.000 đ - 2.000.000 đ', min: 1000000, max: 2000000 },
  { value: 'above_2m', label: 'Trên 2.000.000 đ', min: 2000000, max: 0 },
]

function FilterDrawer({ categories = [], currentCategory = {}, isOpen = true, onClose }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [brands, setBrands] = useState([])
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (currentCategory?.ma_loai) {
      getBrands(currentCategory.ma_loai)
        .then(setBrands)
        .catch(() => setBrands([]))
    } else {
      getBrands()
        .then(setBrands)
        .catch(() => setBrands([]))
    }
  }, [currentCategory])

  const selectedBrand = searchParams.get('brand') || ''
  const selectedStock = searchParams.get('stock') === '1' ? true : false
  const selectedPriceRange = searchParams.get('priceRange') || ''

  function updateParam(key, value) {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }

    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  function handleSearch(e) {
    e.preventDefault()
    updateParam('q', searchText)
  }

  function togglePriceRange(value) {
    if (selectedPriceRange === value) {
      updateParam('priceRange', '')
    } else {
      updateParam('priceRange', value)
    }
  }

  function toggleStock() {
    updateParam('stock', selectedStock ? '' : '1')
  }

  function clearFilters() {
    const sort = searchParams.get('sort')
    const nextParams = new URLSearchParams()

    if (sort) nextParams.set('sort', sort)
    setSearchParams(nextParams)
    setSearchText('')
  }

  const hasActiveFilters = selectedBrand || selectedStock || selectedPriceRange || searchParams.get('q')

  return (
    <aside className={`filter-drawer ${isOpen ? 'is-open' : ''}`}>
      <div className="filter-head">
        <h3>Bộ lọc</h3>

        {onClose && (
          <button type="button" onClick={onClose}>
            Đóng
          </button>
        )}
      </div>

      <div className="filter-group">
        <h4>Tìm kiếm</h4>
        <form onSubmit={handleSearch} className="filter-search-form">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
          />
          <button type="submit" className="btn-primary">
            Tìm
          </button>
        </form>
      </div>

      <div className="filter-group">
        <h4>Khoảng giá</h4>
        <div className="filter-price-grid">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              className={`filter-price-btn ${selectedPriceRange === range.value ? 'active' : ''}`}
              onClick={() => togglePriceRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Thương hiệu</h4>

        <select
          value={selectedBrand}
          onChange={(event) => updateParam('brand', event.target.value)}
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={selectedStock}
            onChange={toggleStock}
          />
          Chỉ hiện sản phẩm còn hàng
        </label>
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn-secondary" onClick={clearFilters}>
          Bỏ chọn
        </button>
      )}

      <div className="filter-group">
        <h4>Danh mục khác</h4>

        <div className="filter-category-list">
          {categories.map((category) => (
            <a key={category.ma_loai} href={`/danh-muc/${category.slug}`}>
              {category.ten_loai}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default FilterDrawer
