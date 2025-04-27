import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Add axios import
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmation from '../components/DeleteConfirmation';

const MallsPage = () => {
  const { t } = useTranslation();
  const [malls, setMalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [filteredMalls, setFilteredMalls] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mallToDelete, setMallToDelete] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMalls = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the auth token from localStorage
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const token = adminUser.token;
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Make the API request with the token in the header
        const response = await axios.get('https://mall-backend-node.vercel.app/api/malls/malls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Update state with the response data
        if (response.data && response.data.success) {
          const mallsData = response.data.malls || [];
          setMalls(mallsData);
          setFilteredMalls(mallsData);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch malls');
        }
      } catch (err) {
        console.error('Error fetching malls:', err);
        setError(err.message || 'Failed to fetch malls');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMalls();
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredMalls(malls);
      return;
    }

    const filtered = malls.filter(mall => 
      mall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mall.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredMalls(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add these functions to your component
  const confirmDelete = (mall) => {
    setMallToDelete(mall);
    setShowDeleteModal(true);
  };
  
  // Fix the fetchMalls function reference in handleDelete
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API request to delete the mall
      await axios.delete(`https://mall-backend-node.vercel.app/api/malls/deleteMall/${mallToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted mall from the state
      const updatedMalls = malls.filter(mall => mall._id !== mallToDelete._id);
      setMalls(updatedMalls);
      setFilteredMalls(updatedMalls);
      
      setShowDeleteModal(false);
      setMallToDelete(null);
      
    } catch (error) {
      console.error('Error deleting mall:', error);
      alert('Failed to delete mall: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMalls.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMalls.length / itemsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading malls</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="malls-page animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('malls')}</h4>
        <Link to="/malls/add" className="btn btn-primary">
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
                placeholder={`${t('search')} ${t('malls')}...`} 
              />
            </div>
          </div>
          
          {currentItems.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-building"></i>
              <h5>{t('noDataFound')}</h5>
              <p className="text-muted">No malls match your search criteria.</p>
            </div>
          ) : (
            <div className="row">
              {currentItems.map(mall => (
                <div key={mall._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <img 
                      src={mall.image || 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'} 
                      className="card-img-top" 
                      alt={mall.name} 
                      style={{ height: '180px', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg';
                      }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{mall.name}</h5>
                      <div className="mb-2 d-flex align-items-center">
                        <i className="bi bi-geo-alt text-muted me-2"></i>
                        <span>{mall.location || 'Location not specified'}</span>
                      </div>
                      <div className="mb-2 d-flex align-items-center">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        <span>{mall.rating || '0'} / 5</span>
                      </div>
                      <div className="mb-2 d-flex align-items-center">
                        <i className="bi bi-clock text-muted me-2"></i>
                        <span>{mall.openingHours || 'Hours not specified'}</span>
                      </div>
                      <div className="mt-3">
                        {mall.facilities && mall.facilities.length > 0 ? (
                          mall.facilities.map((facility, index) => (
                            <span 
                              key={index} 
                              className="badge bg-light text-dark badge-facility"
                            >
                              {facility}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">No facilities listed</span>
                        )}
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <div className="d-flex justify-content-between">
                        <Link to={`/malls/edit/${mall._id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-pencil me-1"></i>
                          {t('edit')}
                        </Link>
                        
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => confirmDelete(mall)}
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
          
          {filteredMalls.length > itemsPerPage && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredMalls.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>

      
    
      <DeleteConfirmation
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={mallToDelete?.name}
        itemImage={mallToDelete?.image}
        itemType="mall"
      />
    </div>
  );
};

export default MallsPage;