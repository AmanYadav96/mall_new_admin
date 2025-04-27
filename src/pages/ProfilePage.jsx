import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';

const ProfilePage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get the auth token and user ID from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      const userId = adminUser.userId || '67f24fa2b5ad30712ec52738'; // Default ID if not found
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`https://mall-backend-node.vercel.app/api/users/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          mobileNumber: userData.mobileNumber || '',
        });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'An error occurred while fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      // Get the auth token and user ID from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      const userId = adminUser.userId || '67f24fa2b5ad30712ec52738'; // Default ID if not found
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create FormData for file upload
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);
      updateData.append('mobileNumber', formData.mobileNumber);
      
      // Add image if available
      if (uploadedImage) {
        // Make sure we're sending the actual File object
        updateData.append('profileImage', uploadedImage);
        console.log('Image being uploaded:', uploadedImage);
      }
      
      // Log the form data for debugging
      for (let pair of updateData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await axios.put(
        `https://mall-backend-node.vercel.app/api/users/updateProfile/${userId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Update response:', response.data);
      
      if (response.data && response.data.success) {
        // Update the user state with the new data
        setUser(response.data.user);
        
        // Update the stored user data in localStorage if needed
        const updatedAdminUser = {
          ...adminUser,
          name: response.data.user.name,
          email: response.data.user.email,
          profileImage: response.data.user.profileImage
        };
        localStorage.setItem('adminUser', JSON.stringify(updatedAdminUser));
        
        alert(t('profileUpdatedSuccess'));
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || error.message || t('profileUpdateError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = (file) => {
    console.log('Image selected:', file);
    setUploadedImage(file);
  };

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
        {error}
      </div>
    );
  }

  return (
    <div className="profile-page animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('profile')}</h4>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="profile-image-container mb-3">
                <img 
                  src={user?.profileImage || 'https://via.placeholder.com/150?text=Profile'} 
                  alt={user?.name} 
                  className="rounded-circle img-fluid" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <h5 className="card-title">{user?.name}</h5>
              <p className="card-text text-muted">{user?.role}</p>
              <p className="card-text">
                <i className="bi bi-envelope me-2"></i>
                {user?.email}
              </p>
              {user?.mobileNumber && (
                <p className="card-text">
                  <i className="bi bi-telephone me-2"></i>
                  {user?.mobileNumber}
                </p>
              )}
              <p className="card-text text-muted">
                <small>
                  {t('memberSince')}: {new Date(user?.createdAt).toLocaleDateString()}
                </small>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">{t('editProfile')}</h5>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">{t('name')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">{t('email')}</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="mobileNumber" className="form-label">{t('mobileNumber')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="mobileNumber" 
                    name="mobileNumber"
                    value={formData.mobileNumber} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label">{t('profileImage')}</label>
                  <ImageUpload 
                    initialImage={user?.profileImage}
                    onImageChange={handleImageChange}
                  />
                </div>
                
                <div className="d-flex justify-content-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t('updating')}
                      </>
                    ) : t('saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Password section removed as requested */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;