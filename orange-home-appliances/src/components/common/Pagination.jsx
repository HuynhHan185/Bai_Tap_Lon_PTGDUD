function Pagination({ page = 1, totalPages = 1, onPageChange }) {
    if (totalPages <= 1) return null
  
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  
    return (
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Trước
        </button>
  
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            className={pageNumber === page ? 'active' : ''}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
  
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Sau
        </button>
      </div>
    )
  }
  
  export default Pagination