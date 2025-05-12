import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios'; // Add axios import

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(''); // Add state for error message

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('invalidEmail'))
      .required(t('required')),
    password: Yup.string()
      .required(t('required'))
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setLoginError(''); // Clear any previous errors
    
    try {
      // Call the real API endpoint
      const response = await axios.post('https://mall-backend-node.vercel.app/api/users/login', {
        email: values.email,
        password: values.password
      });
      
      console.log('Login response:', response.data); // Debug response
      
      // Check if login was successful
      if (response.data && response.data.success) {
        const userData = {
          id: response.data.user?._id || response.data.user?.id,
          name: response.data.user?.name || 'Admin User',
          email: response.data.user?.email,
          role: response.data.user?.role || 'admin',
          avatar: response.data.user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
          token: response.data.token || response.data.accessToken,
          refreshToken: response.data.refreshToken // Store refresh token
        };
        
        // Save to localStorage
        localStorage.setItem('adminUser', JSON.stringify(userData));
        
        setLoading(false);
        navigate('/dashboard');
      } else {
        setLoginError(response.data?.message || t('invalidCredentials'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.response?.data?.message || t('invalidCredentials'));
      setLoading(false);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                 style={{ width: '60px', height: '60px' }}>
              <i className="bi bi-building fs-2"></i>
            </div>
            <h4>{t('adminPanel')}</h4>
            <p className="text-muted">{t('loginToYourAccount')}</p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    {loginError}
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">{t('email')}</label>
                  <Field
                    type="email"
                    name="email"
                    className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                    placeholder="admin@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">{t('password')}</label>
                  <Field
                    type="password"
                    name="password"
                    className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="div" className="invalid-feedback" />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting || loading}
                >
                  {(isSubmitting || loading) && (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  )}
                  {t('login')}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;