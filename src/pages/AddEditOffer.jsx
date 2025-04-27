import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';

const AddEditOffer = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState(null);
  const [shops, setShops] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const isEditMode = !!id;

  // Validation schema
  const validationSchema = Yup.object({
    shopId: Yup.string().required(t('required')),
    title: Yup.string().required(t('required')),
    description: Yup.string().required(t('required')),
    discountPercentage: Yup.number()
      .required(t('required'))
      .min(0, t('mustBePositive'))
      .max(100, t('maxDiscount')),
    startDate: Yup.date().required(t('required')),
    endDate: Yup.date()
      .required(t('required'))
      .min(Yup.ref('startDate'), t('endDateAfterStart')),
  });

  useEffect(() => {
    // Fetch shops for dropdown
    const fetchShops = async () => {
      try {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const token = adminUser.token;
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get('https://mall-backend-node.vercel.app/api/shops/allShops', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          setShops(response.data.shops);
        } else {
          console.error('Unexpected shop data format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
        alert('Failed to fetch shops: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchShops();

    if (isEditMode) {
      setLoading(true);
      // Fetch offer details for edit mode
      const fetchOfferDetails = async () => {
        try {
          const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          const token = adminUser.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          const response = await axios.get(`https://mall-backend-node.vercel.app/api/offers/getOffer/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data) {
            console.log('Fetched offer data:', response.data);
            // Make sure we're accessing the correct property from the response
            const offerData = response.data.offer || response.data;
            setOffer(offerData);
          }
        } catch (error) {
          console.error('Error fetching offer details:', error);
          alert('Failed to fetch offer details: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      };
      
      fetchOfferDetails();
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
      
      // Format dates to ISO string
      const formattedValues = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      };
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', formattedValues.title);
      formData.append('description', formattedValues.description);
      formData.append('discountPercentage', formattedValues.discountPercentage);
      formData.append('startDate', formattedValues.startDate);
      formData.append('endDate', formattedValues.endDate);
      
      // Add image if available
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing offer
        response = await axios.put(
          `https://mall-backend-node.vercel.app/api/offers/updateOffer/${id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new offer - use the shop ID from the form
        response = await axios.post(
          `https://mall-backend-node.vercel.app/api/offers/createOffer/${formattedValues.shopId}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      console.log('Offer data submitted:', response.data);
      navigate('/offers');
      
    } catch (error) {
      console.error('Error submitting offer data:', error);
      alert('Failed to save offer: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImageChange = (file) => {
    setUploadedImage(file);
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (loading && isEditMode && !offer) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Initial form values
  const initialValues = isEditMode && offer
    ? {
        shopId: offer.shop?._id || '',
        title: offer.title || '',
        description: offer.description || '',
        discountPercentage: offer.discountPercentage || 0,
        startDate: formatDateForInput(offer.startDate),
        endDate: formatDateForInput(offer.endDate),
      }
    : {
        shopId: '',
        title: '',
        description: '',
        discountPercentage: 10,
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() + 1))),
      };

  console.log('Form initial values:', initialValues);

  return (
    <div className="add-edit-offer animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{isEditMode ? t('edit') : t('addNew')} {t('offer')}</h4>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/offers')}
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
                      <label htmlFor="shopId" className="form-label">{t('shop')}</label>
                      <Field 
                        as="select" 
                        id="shopId" 
                        name="shopId" 
                        className={`form-select ${errors.shopId && touched.shopId ? 'is-invalid' : ''}`} 
                        disabled={isEditMode}
                      >
                        <option value="">{t('select')} {t('shop')}</option>
                        {shops.map(shop => (
                          <option key={shop._id} value={shop._id}>
                            {shop.shopName} ({shop.mall?.name || 'Unknown Mall'})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="shopId" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="title" className="form-label">{t('title')}</label>
                      <Field 
                        type="text" 
                        id="title" 
                        name="title" 
                        className={`form-control ${errors.title && touched.title ? 'is-invalid' : ''}`} 
                        placeholder={t('offerTitle')}
                      />
                      <ErrorMessage name="title" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="description" className="form-label">{t('description')}</label>
                      <Field 
                        as="textarea" 
                        id="description" 
                        name="description" 
                        rows="3"
                        className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`} 
                        placeholder={t('offerDescription')}
                      />
                      <ErrorMessage name="description" component="div" className="invalid-feedback" />
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-group mb-3">
                      <label htmlFor="discountPercentage" className="form-label">{t('discountPercentage')} (%)</label>
                      <Field 
                        type="number" 
                        id="discountPercentage" 
                        name="discountPercentage" 
                        min="0"
                        max="100"
                        className={`form-control ${errors.discountPercentage && touched.discountPercentage ? 'is-invalid' : ''}`} 
                      />
                      <ErrorMessage name="discountPercentage" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="startDate" className="form-label">{t('startDate')}</label>
                      <Field 
                        type="date" 
                        id="startDate" 
                        name="startDate" 
                        className={`form-control ${errors.startDate && touched.startDate ? 'is-invalid' : ''}`} 
                      />
                      <ErrorMessage name="startDate" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="endDate" className="form-label">{t('endDate')}</label>
                      <Field 
                        type="date" 
                        id="endDate" 
                        name="endDate" 
                        className={`form-control ${errors.endDate && touched.endDate ? 'is-invalid' : ''}`} 
                      />
                      <ErrorMessage name="endDate" component="div" className="invalid-feedback" />
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">{t('image')}</label>
                      <ImageUpload 
                        initialImage={offer?.image}
                        onImageChange={handleImageChange}
                      />
                      <small className="text-muted d-block mt-1">
                        {t('recommendedSize')}: 800x400 px
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2" 
                    onClick={() => navigate('/offers')}
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

export default AddEditOffer;