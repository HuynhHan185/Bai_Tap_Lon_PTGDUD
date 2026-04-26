import { useSearchParams } from 'react-router-dom'

const brands = ['Sharp', 'Philips', 'Panasonic', 'Sunhouse', 'Asia', 'Xiaomi', 'Deerma', 'Kangaroo']

function FilterDrawer({ categories = [], currentCategory = '', isOpen = true, onClose }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedBrand = searchParams.get('brand') || ''
  const selectedStock = searchParams.get('stock') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

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

  function clearFilters() {
    const q = searchParams.get('q')
    const sort = searchParams.get('sort')

    const nextParams = new URLSearchParams()

    if (q) nextParams.set('q', q)
    if (sort) nextParams.set('sort', sort)

    setSearchParams(nextParams)
  }

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
        <h4>Danh mục hiện tại</h4>
        <p>{currentCategory || 'Tất cả sản phẩm'}</p>
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
        <h4>Kho hàng</h4>

        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={selectedStock === 'in-stock'}
            onChange={(event) =>
              updateParam('stock', event.target.checked ? 'in-stock' : '')
            }
          />
          Chỉ hiện sản phẩm còn hàng
        </label>
      </div>

      <div className="filter-group">
        <h4>Khoảng giá</h4>

        <input
          type="number"
          value={minPrice}
          placeholder="Giá từ"
          onChange={(event) => updateParam('minPrice', event.target.value)}
        />

        <input
          type="number"
          value={maxPrice}
          placeholder="Giá đến"
          onChange={(event) => updateParam('maxPrice', event.target.value)}
        />
      </div>

      <div className="filter-group">
        <h4>Danh mục khác</h4>

        <div className="filter-category-list">
          {categories.map((category) => (
            <a key={category.id} href={`/danh-muc/${category.slug}`}>
              {category.name}
            </a>
          ))}
        </div>
      </div>

      <button type="button" className="btn-secondary" onClick={clearFilters}>
        Xóa bộ lọc
      </button>
    </aside>
  )
}

export default FilterDrawer