import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmation from '../components/DeleteConfirmation';

const OffersPage = () => {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOffers();
  }, [currentPage]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API request to fetch offers
      const response = await axios.get('https://mall-backend-node.vercel.app/api/offers/allOffers', {
        params: {
          page: currentPage,
          limit: itemsPerPage
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        setOffers(response.data.offers);
        setFilteredOffers(response.data.offers);
        setTotalItems(response.data.totalOffers);
        setTotalPages(response.data.totalPages);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      alert('Failed to fetch offers: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredOffers(offers);
      return;
    }

    const filtered = offers.filter(offer => 
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.shop?.shopName && offer.shop.shopName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (offer.shop?.mall?.name && offer.shop.mall.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredOffers(filtered);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const confirmDelete = (offer) => {
    setOfferToDelete(offer);
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
      
      // Make API request to delete the offer
      await axios.delete(`https://mall-backend-node.vercel.app/api/offers/deleteOffer/${offerToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh the offers list
      fetchOffers();
      setShowDeleteModal(false);
      setOfferToDelete(null);
      
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Format date to local format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && offers.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-page animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('offers')}</h4>
        <Link to="/offers/add" className="btn btn-primary">
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
                placeholder={`${t('search')} ${t('offers')}...`} 
              />
            </div>
          </div>
          
          {filteredOffers.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-percent"></i>
              <h5>{t('noDataFound')}</h5>
              <p className="text-muted">No offers match your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead>
                  <tr>
                    <th className="text-center">{t('image')}</th>
                    <th className="text-center">{t('title')}</th>
                    <th className="text-center">{t('description')}</th>
                    <th className="text-center">{t('discount')} (%)</th>
                    <th className="text-center">{t('shop')}</th>
                    <th className="text-center">{t('mall')}</th>
                    <th className="text-center">{t('startDate')}</th>
                    <th className="text-center">{t('endDate')}</th>
                    <th className="text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map(offer => (
                    <tr key={offer._id}>
                      <td className="text-center align-middle">
                        <img 
                          src={offer.image || 'https://via.placeholder.com/50?text=No+Image'} 
                          alt={offer.title} 
                          className="img-thumbnail" 
                          width="50" 
                        />
                      </td>
                      <td className="text-center align-middle">{offer.title}</td>
                      <td className="text-center align-middle text-truncate" style={{ maxWidth: '200px' }}>{offer.description}</td>
                      <td className="text-center align-middle">{offer.discountPercentage}%</td>
                      <td className="text-center align-middle">{offer.shop?.shopName || 'Unknown Shop'}</td>
                      <td className="text-center align-middle">{offer.shop?.mall?.name || 'Unknown Mall'}</td>
                      <td className="text-center align-middle">{formatDate(offer.startDate)}</td>
                      <td className="text-center align-middle">{formatDate(offer.endDate)}</td>
                      <td className="text-center align-middle">
                        <Link to={`/offers/edit/${offer._id}`} className="btn btn-action btn-outline-primary me-2">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button 
                          className="btn btn-action btn-outline-danger" 
                          onClick={() => confirmDelete(offer)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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

      <DeleteConfirmation
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={offerToDelete?.title}
      />
    </div>
  );
};

export default OffersPage;