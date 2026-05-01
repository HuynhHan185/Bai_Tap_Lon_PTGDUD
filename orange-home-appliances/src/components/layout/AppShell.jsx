import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useRef, useEffect } from 'react'

import SearchBar from '../common/SearchBar'
import { selectCartCount } from '../../features/cart/cartSlice'
import { selectUser, selectIsAuthenticated, logout } from '../../features/user/userSlice'
import { getCategories } from '../../services/api'

function AppShell() {
  const cartCount = useSelector(selectCartCount)
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [productsOpen, setProductsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProductsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = (e) => {
    e.preventDefault()
    dispatch(logout())
    navigate('/tai-khoan/dang-nhap')
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-top">
          <Link to="/" className="logo">
            CamVang Home
          </Link>

          <SearchBar
            className="header-search"
            placeholder="Tìm nồi cơm, quạt, nồi chiên..."
          />

          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>

          <nav className={`main-nav ${open ? 'is-open' : ''}`}>
            {/* Dropdown Sản phẩm */}
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-dropdown-toggle ${productsOpen ? 'is-open' : ''}`}
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
              >
                Sản phẩm
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {productsOpen && (
                <div className="nav-dropdown-panel">
                  <div className="nav-dropdown-grid">
                    {categories.map((cat) => (
                      <Link
                        key={cat.ma_loai}
                        to={`/danh-muc/${cat.slug}`}
                        className="nav-dropdown-item"
                        onClick={() => setProductsOpen(false)}
                      >
                        {cat.ten_loai}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/gioi-thieu">Giới thiệu</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/tai-khoan">Chào, {user?.fullName || user?.username}</NavLink>
                <a href="#" onClick={handleLogout} style={{ color: '#d70018' }}>Đăng xuất</a>
              </>
            ) : (
              <NavLink to="/tai-khoan/dang-nhap">Đăng nhập</NavLink>
            )}

            <NavLink to="/gio-hang" className="cart-link">
              Giỏ hàng ({cartCount})
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="page-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h4>CamVang Home</h4>
            <p>Đồ điện gia dụng chính hãng, giao nhanh toàn quốc.</p>
          </div>

          <div>
            <h4>Thông tin</h4>
            <Link to="/gioi-thieu">Giới thiệu</Link>
            <Link to="/lien-he">Liên hệ</Link>
          </div>

          <div>
            <h4>Hỗ trợ</h4>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Bảo hành</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default AppShell