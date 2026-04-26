import { Link } from 'react-router-dom'

function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Trang chủ</Link>

      {items.map((item) => (
        <span key={item.label} className="breadcrumb-item">
          <span>/</span>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs