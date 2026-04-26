import { useEffect, useState } from 'react'

function ProductGallery({ product }) {
  const images = product.images?.length ? product.images : []
  const [currentImage, setCurrentImage] = useState(images[0])

  useEffect(() => {
    setCurrentImage(images[0])
  }, [product.id])

  if (!images.length) {
    return (
      <div className="product-gallery">
        <div className="gallery-placeholder">Không có ảnh</div>
      </div>
    )
  }

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img src={currentImage} alt={product.name} />
      </div>

      <div className="gallery-thumbs">
        {images.map((image) => (
          <button
            key={image}
            className={image === currentImage ? 'active' : ''}
            onClick={() => setCurrentImage(image)}
            type="button"
          >
            <img src={image} alt={product.name} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductGallery