import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmation from '../components/DeleteConfirmation';

const CouponsPage = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API request
      const response = await axios.get('https://mall-backend-node.vercel.app/api/coupons/allCoupons', {
        params: {
          page: currentPage,
          limit: itemsPerPage
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        setCoupons(response.data.coupons || []);
        setFilteredCoupons(response.data.coupons || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalCoupons || 0);
      } else {
        throw new Error('Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Failed to fetch coupons: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredCoupons(coupons);
      return;
    }
    
    const filtered = coupons.filter(coupon => 
      coupon.code.toLowerCase().includes(term.toLowerCase()) ||
      coupon.description.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredCoupons(filtered);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const confirmDelete = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API request to delete the coupon
      await axios.delete(`https://mall-backend-node.vercel.app/api/coupons/deleteCoupon/${couponToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted coupon from the state
      const updatedCoupons = coupons.filter(coupon => coupon._id !== couponToDelete._id);
      setCoupons(updatedCoupons);
      setFilteredCoupons(updatedCoupons);
      
      setShowDeleteModal(false);
      setCouponToDelete(null);
      
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="coupons-page animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('coupons')}</h4>
        <Link to="/coupons/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          {t('addNew')}
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-4">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder={`${t('search')} ${t('coupons')}...`} 
            />
          </div>
          
          {filteredCoupons.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-ticket-perforated"></i>
              <h5>{t('noDataFound')}</h5>
              <p className="text-muted">No coupons match your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{t('code')}</th>
                    <th>{t('discount')}</th>
                    <th>{t('validFrom')}</th>
                    <th>{t('validTo')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                // In the table row where you're displaying coupon data
                <tbody>
                  {filteredCoupons.map(coupon => (
                    <tr key={coupon._id}>
                      <td>
                        <span className="badge bg-light text-dark p-2">{coupon.code}</span>
                      </td>
                      <td>
                        {/* Fix discount display */}
                        {coupon.discountType === 'percentage' || coupon.discountType === undefined
                          ? `${coupon.discountAmount || coupon.discountValue}%` 
                          : `$${coupon.discountAmount || coupon.discountValue}`}
                      </td>
                      <td>
                        {/* Fix date display */}
                        {coupon.startDate || coupon.validFrom 
                          ? new Date(coupon.startDate || coupon.validFrom).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td>
                        {/* Fix date display */}
                        {coupon.endDate || coupon.validTo 
                          ? new Date(coupon.endDate || coupon.validTo).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td>
                        {/* Fix status display */}
                        {(coupon.endDate || coupon.validTo) && new Date(coupon.endDate || coupon.validTo) >= new Date() ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Expired</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/coupons/edit/${coupon._id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => confirmDelete(coupon)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {totalItems > itemsPerPage && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={couponToDelete?.code}
        itemType="coupon"
      />
    </div>
  );
};

export default CouponsPage;