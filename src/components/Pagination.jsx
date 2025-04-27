import { useTranslation } from 'react-i18next';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage 
}) => {
  const { t } = useTranslation();
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Calculate which items are being shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  // Create a handler that prevents default behavior before changing page
  const handlePageChange = (pageNumber, event) => {
    if (event) {
      event.preventDefault();
    }
    
    // Only change page if it's different from current page
    if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="text-muted">
        {t('showing')} {startItem} {t('to')} {endItem} {t('of')} {totalItems} {t('entries')}
      </div>
      
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={(e) => handlePageChange(currentPage - 1, e)}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          
          {pages.map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button 
                className="page-link"
                onClick={(e) => handlePageChange(page, e)}
              >
                {page}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={(e) => handlePageChange(currentPage + 1, e)}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;