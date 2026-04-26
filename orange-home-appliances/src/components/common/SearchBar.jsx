import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBar({ placeholder = 'Tìm sản phẩm...', className = '' }) {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const q = keyword.trim()

    if (q) {
      navigate(`/tim-kiem?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/tim-kiem')
    }
  }

  return (
    <form className={className || 'search-bar'} onSubmit={handleSubmit}>
      <input
        type="search"
        value={keyword}
        placeholder={placeholder}
        onChange={(event) => setKeyword(event.target.value)}
        aria-label="Tìm kiếm sản phẩm"
      />

      <button type="submit">Tìm</button>
    </form>
  )
}

export default SearchBar