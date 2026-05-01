import { useEffect, useState } from 'react'

function ProductGallery({ product }) {
  const imageList = (() => {
    if (product.hinh_anh_list) {
      try {
        const parsed = typeof product.hinh_anh_list === 'string'
          ? JSON.parse(product.hinh_anh_list)
          : product.hinh_anh_list
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })()
  const images = product.hinh_anh ? [product.hinh_anh, ...imageList] : imageList
  const [currentImage, setCurrentImage] = useState(images[0] || null)

  useEffect(() => {
    setCurrentImage(images[0] || null)
  }, [product.ma_sp])

  if (!images.length) {
    return (
      <div className="product-gallery">
        <div className="gallery-placeholder">
          <img src="https://placehold.co/400x400?text=Không+có+ảnh" alt="Không có ảnh" />
        </div>
      </div>
    )
  }

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img src={currentImage} alt={product.ten_sp} />
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((image) => (
            <button
              key={image}
              className={image === currentImage ? 'active' : ''}
              onClick={() => setCurrentImage(image)}
              type="button"
            >
              <img src={image} alt={product.ten_sp} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
