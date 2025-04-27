import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmation from '../components/DeleteConfirmation';

const ShopsPage = () => {
  const { t } = useTranslation();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [selectedMall, setSelectedMall] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [malls, setMalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);

  useEffect(() => {
    fetchShops(currentPage);
  }, [currentPage]);

  const fetchShops = async (page = 1) => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API request with pagination parameters
      const response = await axios.get('https://mall-backend-node.vercel.app/api/shops/allShops', {
        params: {
          page: page,
          limit: itemsPerPage,
          mall: selectedMall || undefined,
          category: selectedCategory || undefined
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response.data);
      
      // Check if response has the expected structure
      if (response.data && response.data.success) {
        // Extract pagination data
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalShops || 0);
        
        // Extract shops data
        const shopsData = response.data.shops || [];
        
        // Extract unique malls and categories for filters (only on first load)
        if (page === 1 && malls.length === 0) {
          const mallsList = [...new Set(shopsData.map(shop => shop.mall?.name || 'Unknown'))];
          const categoriesList = [...new Set(shopsData.map(shop => shop.category || 'Uncategorized'))];
          
          setMalls(mallsList);
          setCategories(categoriesList);
        }
        
        setShops(shopsData);
        setFilteredShops(shopsData);
      } else {
        console.error('Unexpected API response format:', response.data);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      alert('Failed to fetch shops: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    // For server-side search, we would need to call the API with search parameters
    // For now, we'll do client-side filtering on the current page data
    if (searchTerm) {
      const filtered = shops.filter(shop => 
        shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.mall?.name && shop.mall.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredShops(filtered);
    } else {
      setFilteredShops(shops);
    }
  };

  const handleMallChange = (e) => {
    const mall = e.target.value;
    setSelectedMall(mall);
    setCurrentPage(1); // Reset to first page
    
    // Ideally, we would call the API with the new filter
    // For now, we'll simulate by calling fetchShops
    fetchShops(1);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page
    
    // Ideally, we would call the API with the new filter
    // For now, we'll simulate by calling fetchShops
    fetchShops(1);
  };

  const handlePageChange = (pageNumber) => {
    console.log('Changing to page:', pageNumber);
    setCurrentPage(pageNumber);
    // fetchShops will be called by the useEffect that depends on currentPage
  };

  const confirmDelete = (shop) => {
    setShopToDelete(shop);
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
      
      // Make API request to delete the shop
      await axios.delete(`https://mall-backend-node.vercel.app/api/shops/deleteShop/${shopToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted shop from the state
      const updatedShops = shops.filter(shop => shop._id !== shopToDelete._id);
      setShops(updatedShops);
      setFilteredShops(updatedShops);
      
      setShowDeleteModal(false);
      setShopToDelete(null);
      
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Failed to delete shop: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && shops.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="shops-page animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('shops')}</h4>
        <Link to="/shops/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          {t('addNew')}
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4 mb-3 mb-md-0">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder={`${t('search')} ${t('shops')}...`} 
              />
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              {/* <select 
                className="form-select" 
                value={selectedMall}
                onChange={handleMallChange}
              >
                <option value="">{t('all')} {t('malls')}</option>
                {malls.map((mall, index) => (
                  <option key={index} value={mall}>{mall}</option>
                ))}
              </select> */}
            </div>
            {/* <div className="col-md-4">
              <select 
                className="form-select" 
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">{t('all')} {t('categories')}</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div> */}
          </div>
          
          {filteredShops.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-shop"></i>
              <h5>{t('noDataFound')}</h5>
              <p className="text-muted">No shops match your search criteria.</p>
            </div>
          ) : (
            <div className="row">
              {filteredShops.map(shop => (
                <div key={shop._id} className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <img 
                      src={shop.image || 'https://via.placeholder.com/300x160?text=No+Image'} 
                      className="card-img-top" 
                      alt={shop.shopName} 
                      style={{ height: '160px', objectFit: 'cover' }} 
                    />
                    <div className="card-body">
                      <h5 className="card-title">{shop.shopName}</h5>
                      <div className="mb-2 d-flex align-items-center">
                        <i className="bi bi-building text-muted me-2"></i>
                        <span>{shop.mall?.name || 'Unknown Mall'}</span>
                      </div>
                      <div className="mb-2 d-flex align-items-center">
                        <i className="bi bi-tag text-muted me-2"></i>
                        <span>{shop.category || 'Uncategorized'}</span>
                      </div>
                      <div className="mb-2 d-flex align-items-center">
                        <i className="bi bi-clock text-muted me-2"></i>
                        <span>{shop.openingHours || 'Not specified'}</span>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <div className="d-flex justify-content-between">
                        <Link to={`/shops/edit/${shop._id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-pencil me-1"></i>
                          {t('edit')}
                        </Link>
                        // In your JSX where you have the delete button
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => confirmDelete(shop)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

      // At the end of your return statement
      <DeleteConfirmation
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={shopToDelete?.shopName}
        itemImage={shopToDelete?.image}
        itemType="shop"
      />
    </div>
  );
};

export default ShopsPage;