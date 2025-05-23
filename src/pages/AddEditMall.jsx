import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import ImageUpload from '../components/ImageUpload';
import axios from 'axios'; // Add axios import

// Location Picker Component
const LocationPicker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const AddEditMall = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { latitude: initialLatitude, longitude: initialLongitude } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [mall, setMall] = useState(null);
  const [mapPosition, setMapPosition] = useState([51.505, -0.09]); // Default position
  const [uploadedImage, setUploadedImage] = useState(null);
  const [geocodedAddress, setGeocodedAddress] = useState('');
  const isEditMode = !!id;

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyA0pQ0z_ukpaRyeB0b61mDkTQGknjPWDo0';

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required(t('required')),
    location: Yup.string().required(t('required')),
    rating: Yup.number().min(0).max(5).required(t('required')),
    openingHours: Yup.string().required(t('required')),
    facilities: Yup.string().required(t('required'))
  });

  // Fetch address from coordinates
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await axios.get(reverseGeocodeUrl);
      
      if (response.data.results && response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address;
        setGeocodedAddress(address);
        return address;
      } else {
        console.error('No address found for these coordinates');
        setGeocodedAddress('No address found');
        return '';
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setGeocodedAddress('Error fetching address');
      return '';
    }
  };

  // Update address when map position changes
  useEffect(() => {
    if (mapPosition && mapPosition.length === 2) {
      fetchAddressFromCoordinates(mapPosition[0], mapPosition[1]);
    }
  }, [mapPosition]);

  // Custom map position setter that also updates the address
  const handleMapPositionChange = (newPosition) => {
    setMapPosition(newPosition);
    fetchAddressFromCoordinates(newPosition[0], newPosition[1]);
  };

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      
      const fetchMallById = async () => {
        try {
          // Get the auth token from localStorage
          const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          const token = adminUser.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // Make the API request with the token in the header
          const response = await axios.get(`https://mall-backend-node.vercel.app/api/malls/mallById/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Mall API response:', response.data);
          
          // Update state with the response data - the mall data is directly in response.data
          if (response.data && response.data._id) {
            const mallData = response.data;
            console.log('Mall image URL:', mallData.image); // Add this line to debug
            setMall({
              ...mallData,
              facilities: Array.isArray(mallData.facilities) ? mallData.facilities.join(', ') : ''
            });
            
            // Set map position if coordinates exist
            if (mallData.coordinates && mallData.coordinates.lat && mallData.coordinates.lng) {
              setMapPosition([mallData.coordinates.lat, mallData.coordinates.lng]);
            }
          } else {
            throw new Error('Invalid mall data received');
          }
        } catch (err) {
          console.error('Error fetching mall details:', err);
          alert('Failed to fetch mall details: ' + (err.response?.data?.message || err.message));
          navigate('/malls'); // Redirect back to malls list on error
        } finally {
          setLoading(false);
        }
      };
      
      fetchMallById();
    }
  }, [id, isEditMode, navigate]);

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
      
      // Add all form fields to FormData
      Object.keys(values).forEach(key => {
        if (key === 'facilities' && Array.isArray(values[key])) {
          // Handle facilities array
          values[key].forEach(facility => {
            formData.append('facilities', facility);
          });
        } else {
          formData.append(key, values[key]);
        }
      });
      
      // Add coordinates from map selection - ensure they're strings
      formData.append('latitude', String(mapPosition[0]));
      formData.append('longitude', String(mapPosition[1]));
      
      // Also add as coordinates object for backend compatibility
      formData.append('coordinates', JSON.stringify({
        lat: mapPosition[0],
        lng: mapPosition[1]
      }));
      
      // Add image if available
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      
      // Log the form data for debugging
      console.log('Form values:', values);
      console.log('Map coordinates:', mapPosition);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      let response;
      
      if (isEditMode && id) {
        console.log('Updating mall with ID:', id);
        // Update existing mall
        response = await axios.put(
          `https://mall-backend-node.vercel.app/api/malls/updateMall/${id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new mall
        response = await axios.post(
          'https://mall-backend-node.vercel.app/api/malls/create',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      console.log('Mall data submitted:', response.data);
      navigate('/malls');
      
    } catch (error) {
      console.error('Error submitting mall data:', error);
      alert('Failed to save mall: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Initial form values
  const initialValues = isEditMode && mall
    ? {
        name: mall.name,
        location: mall.location,
        rating: mall.rating,
        openingHours: mall.openingHours,
        facilities: mall.facilities
      }
    : {
        name: '',
        location: '',
        rating: 0,
        openingHours: '',
        facilities: ''
      };

  return (
    <div className="add-edit-mall animate-entry">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{isEditMode ? t('edit') : t('addNew')} {t('mall')}</h4>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/malls')}
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
                      <label htmlFor="name" className="form-label">{t('name')}</label>
                      <Field 
                        type="text" 
                        id="name" 
                        name="name" 
                        className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`} 
                        placeholder={t('mallName')}
                      />
                      <ErrorMessage name="name" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="location" className="form-label">{t('location')}</label>
                      <Field 
                        type="text" 
                        id="location" 
                        name="location" 
                        className={`form-control ${errors.location && touched.location ? 'is-invalid' : ''}`} 
                        placeholder={t('location')}
                      />
                      <ErrorMessage name="location" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="rating" className="form-label">{t('rating')}</label>
                      <Field 
                        type="number" 
                        id="rating" 
                        name="rating" 
                        step="0.1"
                        min="0"
                        max="5"
                        className={`form-control ${errors.rating && touched.rating ? 'is-invalid' : ''}`} 
                      />
                      <ErrorMessage name="rating" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="openingHours" className="form-label">{t('openingHours')}</label>
                      <Field 
                        type="text" 
                        id="openingHours" 
                        name="openingHours" 
                        className={`form-control ${errors.openingHours && touched.openingHours ? 'is-invalid' : ''}`} 
                        placeholder="09:00 - 22:00"
                      />
                      <ErrorMessage name="openingHours" component="div" className="invalid-feedback" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="facilities" className="form-label">{t('facilities')}</label>
                      <Field 
                        as="textarea" 
                        id="facilities" 
                        name="facilities" 
                        className={`form-control ${errors.facilities && touched.facilities ? 'is-invalid' : ''}`} 
                        placeholder="Parking, Food Court, WiFi, etc."
                        rows="3"
                      />
                      <ErrorMessage name="facilities" component="div" className="invalid-feedback" />
                      <small className="form-text text-muted">Separate facilities with commas</small>
                    </div>
                    
                    {/* Add geocoded address field */}
                    <div className="form-group mb-3">
                      <label htmlFor="geocodedAddress" className="form-label">Location of Selected Coordinates</label>
                      <input
                        type="text"
                        id="geocodedAddress"
                        className="form-control"
                        value={geocodedAddress}
                        readOnly
                        placeholder="Address will appear here after selecting location on map"
                      />
                      <small className="form-text text-muted">This address is automatically generated from the map coordinates</small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    // In the ImageUpload component usage section:
                    <div className="form-group mb-3">
                      <label className="form-label">{t('image')}</label>
                      <ImageUpload 
                        initialImage={mall?.image || ''}
                        onImageChange={(file) => setUploadedImage(file)}
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label">{t('location')} ({t('map')})</label>
                      <div className="map-container">
                        <MapContainer center={mapPosition} zoom={13} style={{ height: '300px' }}>
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationPicker position={mapPosition} setPosition={handleMapPositionChange} />
                        </MapContainer>
                      </div>
                      <div className="row mt-2">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">{t('latitude')}</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={mapPosition[0]} 
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">{t('longitude')}</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={mapPosition[1]} 
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <small className="form-text text-muted">Click on the map to set location</small>
                    </div>
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2" 
                    onClick={() => navigate('/malls')}
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

export default AddEditMall;