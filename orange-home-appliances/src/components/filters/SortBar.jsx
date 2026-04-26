import { useSearchParams } from 'react-router-dom'

function SortBar({ total = 0, onOpenFilter }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || '-createdAt'

  function handleSortChange(event) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', event.target.value)
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  return (
    <div className="sort-bar">
      <div>
        <strong>{total}</strong> sản phẩm
      </div>

      <div className="sort-actions">
        {onOpenFilter && (
          <button type="button" className="btn-secondary filter-toggle" onClick={onOpenFilter}>
            Lọc
          </button>
        )}

        <select value={sort} onChange={handleSortChange}>
          <option value="-createdAt">Mới nhất</option>
          <option value="price">Giá tăng dần</option>
          <option value="-price">Giá giảm dần</option>
          <option value="name">Tên A-Z</option>
        </select>
      </div>
    </div>
  )
}

export default SortBar