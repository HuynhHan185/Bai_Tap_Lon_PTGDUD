import { useState } from 'react'

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description')

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
          <p>{product.description}</p>
        </div>
      )}

      {activeTab === 'specs' && (
        <div className="tab-panel">
          <h2>Thông số kỹ thuật</h2>

          <table className="spec-table">
            <tbody>
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="tab-panel">
          <h2>Đánh giá</h2>
          <p>
            {product.rating || 5}/5 từ {product.reviewCount || 0} lượt đánh giá.
          </p>
          <p>Chức năng đánh giá chi tiết có thể nối backend thật sau.</p>
        </div>
      )}
    </section>
  )
}

export default ProductTabs