import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';

const AddEditCoupon = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [shops, setShops] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const isEditMode = !!id;

  // Validation schema
  const validationSchema = Yup.object({
    shopId: Yup.string().required(t('required')),
    code: Yup.string().required(t('required')).uppercase(),
    discountAmount: Yup.number()
      .required(t('required'))
      .min(0, t('mustBePositive'))
      .max(100, t('maxDiscount')),
    startDate: Yup.date().required(t('required')),
    endDate: Yup.date()
      .required(t('required'))
      .min(Yup.ref('startDate'), t('endDateAfterStart')),
    usageLimit: Yup.number()
      .required(t('required'))
      .min(1, t('minUsageLimit'))
      .integer(t('mustBeInteger')),
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
      // Fetch coupon details for edit mode
      const fetchCouponDetails = async () => {
        try {
          const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          const token = adminUser.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          const response = await axios.get(`https://mall-backend-node.vercel.app/api/coupons/getCoupon/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Coupon API response:', response.data);
          
          if (response.data && (response.data.data || response.data)) {
            // The coupon data is nested inside the 'data' property
            const couponData = response.data.data || response.data;
            setCoupon(couponData);
          }
        } catch (error) {
          console.error('Error fetching coupon details:', error);
          alert('Failed to fetch coupon details: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      };
      
      fetchCouponDetails();
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
      formData.append('shop', formattedValues.shopId);
      formData.append('code', formattedValues.code.toUpperCase());
      formData.append('discountAmount', formattedValues.discountAmount);
      formData.append('startDate', formattedValues.startDate);
      formData.append('endDate', formattedValues.endDate);
      formData.append('usageLimit', formattedValues.usageLimit);
      
      // Add image if available
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing coupon
        response = await axios.put(
          `https://mall-backend-node.vercel.app/api/coupons/updateCoupon/${id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new coupon
        response = await axios.post(
          `https://mall-backend-node.vercel.app/api/coupons/createCoupon/${formattedValues.shopId}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      console.log('Coupon data submitted:', response.data);
      navigate('/coupons');
      
    } catch (error) {
      console.error('Error submitting coupon data:', error);
      alert('Failed to save coupon: ' + (error.response?.data?.message || error.message));
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

  if (loading && isEditMode && !coupon) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Initial form values
  const initialValues = isEditMode && coupon
    ? {
        shopId: coupon.shop?._id || '',
        code: coupon.code || '',
        discountAmount: coupon.discountAmount || 0,
        startDate: formatDateForInput(coupon.startDate),
        endDate: formatDateForInput(coupon.endDate),
        usageLimit: coupon.usageLimit || 1
      }
    : {
        shopId: '',
        code: '',
        discountAmount: 10,
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() + 1))),
        usageLimit: 1
      };

  return (
    <div className="add-edit-coupon animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{isEditMode ? t('edit') : t('addNew')} {t('coupon')}</h4>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/coupons')}
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
            {({ errors, touched, isSubmitting, values }) => (
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
                      <label htmlFor="code" className="form-label">{t('code')}</label>
                      <Field 
                        type="text" 
                        id="code" 
                        name="code" 
                        className={`form-control text-uppercase ${errors.code && touched.code ? 'is-invalid' : ''}`} 
                        placeholder="SUMMER25"
                      />
                      <ErrorMessage name="code" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="discountAmount" className="form-label">{t('discountAmount')} (%)</label>
                      <Field 
                        type="number" 
                        id="discountAmount" 
                        name="discountAmount" 
                        min="0"
                        max="100"
                        className={`form-control ${errors.discountAmount && touched.discountAmount ? 'is-invalid' : ''}`} 
                      />
                      <ErrorMessage name="discountAmount" component="div" className="invalid-feedback" />
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
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

                    <div className="form-group mb-3">
                      <label htmlFor="usageLimit" className="form-label">{t('usageLimit')}</label>
                      <Field 
                        type="number" 
                        id="usageLimit" 
                        name="usageLimit" 
                        min="1"
                        className={`form-control ${errors.usageLimit && touched.usageLimit ? 'is-invalid' : ''}`} 
                      />
                      <ErrorMessage name="usageLimit" component="div" className="invalid-feedback" />
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">{t('image')}</label>
                      <ImageUpload 
                        initialImage={coupon?.image}
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
                    onClick={() => navigate('/coupons')}
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

export default AddEditCoupon;