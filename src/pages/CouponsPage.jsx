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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
      
      // Make API request to fetch coupons
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
        setCoupons(response.data.coupons);
        setFilteredCoupons(response.data.coupons);
        setTotalItems(response.data.totalCoupons);
        setTotalPages(response.data.totalPages);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Failed to fetch coupons: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredCoupons(coupons);
      return;
    }

    const filtered = coupons.filter(coupon => 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.shop?.shopName && coupon.shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
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
      
      // Refresh the coupons list
      fetchCoupons();
      setShowDeleteModal(false);
      setCouponToDelete(null);
      
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Format date to local format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          <div className="row mb-3">
            <div className="col-md-6">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder={`${t('search')} ${t('coupons')}...`} 
              />
            </div>
          </div>
          
          <div className="table-responsive">
            {filteredCoupons.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-ticket-perforated"></i>
                <h5>{t('noDataFound')}</h5>
                <p className="text-muted">No coupons match your search criteria.</p>
              </div>
            ) : (
              <table className="table table-hover text-center">
                <thead>
                  <tr>
                    <th className="text-center">{t('image')}</th>
                    <th className="text-center">{t('code')}</th>
                    <th className="text-center">{t('shopName')}</th>
                    <th className="text-center">{t('mall')}</th>
                    <th className="text-center">{t('discountAmount')}</th>
                    <th className="text-center">{t('startDate')}</th>
                    <th className="text-center">{t('endDate')}</th>
                    <th className="text-center">{t('usageLimit')}</th>
                    <th className="text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map(coupon => (
                    <tr key={coupon._id}>
                      <td className="text-center align-middle">
                        <img 
                          src={coupon.image || 'https://via.placeholder.com/50?text=No+Image'} 
                          alt={coupon.code} 
                          className="img-thumbnail" 
                          width="50" 
                        />
                      </td>
                      <td className="text-center align-middle"><span className="badge bg-light text-dark">{coupon.code}</span></td>
                      <td className="text-center align-middle">{coupon.shop?.shopName || 'Unknown Shop'}</td>
                      <td className="text-center align-middle">{coupon.shop?.mall?.name || 'Unknown Mall'}</td>
                      <td className="text-center align-middle">{coupon.discountAmount}%</td>
                      <td className="text-center align-middle">{formatDate(coupon.startDate)}</td>
                      <td className="text-center align-middle">{formatDate(coupon.endDate)}</td>
                      <td className="text-center align-middle">{coupon.usageLimit}</td>
                      <td className="text-center align-middle">
                        <Link to={`/coupons/edit/${coupon._id}`} className="btn btn-action btn-outline-primary me-2">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button 
                          className="btn btn-action btn-outline-danger" 
                          onClick={() => confirmDelete(coupon)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
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

      <DeleteConfirmation
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={couponToDelete?.code}
      />
    </div>
  );
};

export default CouponsPage;