import { useState } from 'react'

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description')

  const thongSo = (() => {
    if (!product.thong_so) return {}
    if (typeof product.thong_so === 'string') {
      try { return JSON.parse(product.thong_so) } catch { return {} }
    }
    return product.thong_so
  })()

  return (
    <section className="product-tabs">
      <div className="tab-buttons">
        <button
          type="button"
          className={activeTab === 'description' ? 'active' : ''}
          onClick={() => setActiveTab('description')}
        >
          Mô tả
        </button>

        <button
          type="button"
          className={activeTab === 'specs' ? 'active' : ''}
          onClick={() => setActiveTab('specs')}
        >
          Thông số
        </button>

        <button
          type="button"
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          Đánh giá
        </button>
      </div>

      {activeTab === 'description' && (
        <div className="tab-panel">
          <h2>Mô tả sản phẩm</h2>
          <p>{product.mo_ta || product.mo_ta_ngan || 'Chưa có mô tả.'}</p>
        </div>
      )}

      {activeTab === 'specs' && (
        <div className="tab-panel">
          <h2>Thông số kỹ thuật</h2>

          {Object.keys(thongSo).length > 0 ? (
            <table className="spec-table">
              <tbody>
                {Object.entries(thongSo).map(([key, value]) => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có thông số kỹ thuật.</p>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="tab-panel">
          <h2>Đánh giá</h2>
          <p>
            {product.rating || 5}/5 sao.
          </p>
          <p>Chức năng đánh giá chi tiết có thể nối backend thật sau.</p>
        </div>
      )}
    </section>
  )
}

export default ProductTabs
