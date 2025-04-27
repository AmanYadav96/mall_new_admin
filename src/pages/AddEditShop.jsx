import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ImageUpload from '../components/ImageUpload';
import axios from 'axios'; // Add axios import

const AddEditShop = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [malls, setMalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const isEditMode = !!id;

  // Validation schema
  const validationSchema = Yup.object({
    shopName: Yup.string().required(t('required')),
    mallId: Yup.string().required(t('required')),
    category: Yup.string().required(t('required')),
    openingHours: Yup.string().required(t('required')),
  });

  useEffect(() => {
    // Fetch malls from API
    // In the fetchMalls function, update the API endpoint
    const fetchMalls = async () => {
      try {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const token = adminUser.token;
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Updated endpoint to match your API
        const response = await axios.get('https://mall-backend-node.vercel.app/api/malls/malls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Check if response has the expected structure
        if (response.data && Array.isArray(response.data.malls)) {
          setMalls(response.data.malls);
        } else if (Array.isArray(response.data)) {
          // Handle case where response is directly an array
          setMalls(response.data);
        } else {
          console.error('Unexpected mall data format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching malls:', error);
        alert('Failed to fetch malls: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchMalls();
    
    // Set predefined categories
    const predefinedCategories = [
      "Clothing", "Electronics", "Sports", "Books", "Toys", 
      "Jewelry", "Food", "Beauty", "Home", "Other"
    ];
    setCategories(predefinedCategories);

    if (isEditMode) {
      setLoading(true);
      // Fetch shop details for edit mode
      const fetchShopDetails = async () => {
        try {
          const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          const token = adminUser.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          const response = await axios.get(`https://mall-backend-node.vercel.app/api/shops/shopById/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data) {
            setShop(response.data);
          }
        } catch (error) {
          console.error('Error fetching shop details:', error);
          alert('Failed to fetch shop details: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      };
      
      fetchShopDetails();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const token = adminUser.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('shopName', values.shopName);
      formData.append('category', values.category);
      formData.append('openingHours', values.openingHours);
      formData.append('rating', values.rating || 0);
      formData.append('mall', values.mallId); // Add mall ID for update
      
      // Add image if available
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing shop using the correct endpoint
        response = await axios.put(
          `https://mall-backend-node.vercel.app/api/shops/updateShop/${id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Shop updated successfully:', response.data);
      } else {
        // Create new shop
        response = await axios.post(
          `https://mall-backend-node.vercel.app/api/shops/createShop/${values.mallId}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Shop created successfully:', response.data);
      }
      
      navigate('/shops');
      
    } catch (error) {
      console.error('Error submitting shop data:', error);
      alert('Failed to save shop: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImageChange = (file) => {
    setUploadedImage(file);
  };

  if (loading && isEditMode && !shop) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Initial form values
  const initialValues = isEditMode && shop
    ? {
        shopName: shop.shopName,
        mallId: shop.mall?._id || '',
        category: shop.category,
        openingHours: shop.openingHours,
        rating: shop.rating || 0
      }
    : {
        shopName: '',
        mallId: '',
        category: '',
        openingHours: '',
        rating: 0
      };

  return (
    <div className="add-edit-shop animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{isEditMode ? t('edit') : t('addNew')} {t('shop')}</h4>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/shops')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {t('back')}
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="form-group mb-3">
                      <label htmlFor="shopName" className="form-label">{t('name')}</label>
                      <Field 
                        type="text" 
                        id="shopName" 
                        name="shopName" 
                        className={`form-control ${errors.shopName && touched.shopName ? 'is-invalid' : ''}`} 
                        placeholder={t('shopName')}
                      />
                      <ErrorMessage name="shopName" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="mallId" className="form-label">{t('mall')}</label>
                      <Field 
                        as="select" 
                        id="mallId" 
                        name="mallId" 
                        className={`form-select ${errors.mallId && touched.mallId ? 'is-invalid' : ''}`} 
                      >
                        <option value="">{t('select')} {t('mall')}</option>
                        {malls.map(mall => (
                          <option key={mall._id} value={mall._id}>{mall.name}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="mallId" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="category" className="form-label">{t('category')}</label>
                      <Field 
                        as="select" 
                        id="category" 
                        name="category" 
                        className={`form-select ${errors.category && touched.category ? 'is-invalid' : ''}`} 
                      >
                        <option value="">{t('select')} {t('category')}</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="openingHours" className="form-label">{t('openingHours')}</label>
                      <Field 
                        type="text" 
                        id="openingHours" 
                        name="openingHours" 
                        className={`form-control ${errors.openingHours && touched.openingHours ? 'is-invalid' : ''}`} 
                        placeholder="09:00 AM - 09:00 PM"
                      />
                      <ErrorMessage name="openingHours" component="div" className="invalid-feedback" />
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="rating" className="form-label">{t('rating')}</label>
                      <Field 
                        type="number" 
                        id="rating" 
                        name="rating" 
                        min="0"
                        max="5"
                        step="0.1"
                        className="form-control"
                        placeholder="0.0 - 5.0"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">{t('image')}</label>
                      <ImageUpload 
                        initialImage={shop?.image}
                        onImageChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2" 
                    onClick={() => navigate('/shops')}
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting || loading}
                  >
                    {(isSubmitting || loading) && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    {isEditMode ? t('save') : t('add')}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddEditShop;