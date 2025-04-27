import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UserTable from '../components/UserTable';
import UserFilters from '../components/UserFilters';

const UsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    // Update the fetchUsers function in UsersPage.jsx
    const fetchUsers = async () => {
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
        const response = await axios.get('https://mall-backend-node.vercel.app/api/users/allUsers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Update state with the response data
        if (response.data && response.data.success) {
          const userData = response.data.users || [];
          setUsers(userData);
          setFilteredUsers(userData);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    let result = [...users];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    if (filters.status) {
      result = result.filter(user => user.status === filters.status);
    }
    
    setFilteredUsers(result);
  }, [filters, users]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="users-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('users')}</h4>
        {/* <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          {t('addNewUser')}
        </button> */}
      </div>
      
      <UserFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error loading users</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please try refreshing the page or contact support.</p>
        </div>
      ) : (
        <UserTable users={filteredUsers} />
      )}
    </div>
  );
};

export default UsersPage;