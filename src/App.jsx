import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import MallsPage from './pages/MallsPage';
import ShopsPage from './pages/ShopsPage';
import CouponsPage from './pages/CouponsPage';
import OffersPage from './pages/OffersPage';
import ProfilePage from './pages/ProfilePage';
import AddEditMall from './pages/AddEditMall';
import AddEditShop from './pages/AddEditShop';
import AddEditCoupon from './pages/AddEditCoupon';
import AddEditOffer from './pages/AddEditOffer';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const adminUser = localStorage.getItem('adminUser');

  useEffect(() => {
    if (!adminUser) {
      navigate('/login');
    }
  }, [adminUser, navigate]);

  return adminUser ? children : null;
};

function App() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState('en');

  // Set RTL or LTR based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout changeLanguage={changeLanguage} currentLang={lang} />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="malls" element={<MallsPage />} />
          <Route path="malls/add" element={<AddEditMall />} />
          <Route path="malls/edit/:id" element={<AddEditMall />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/add" element={<AddEditShop />} />
          <Route path="shops/edit/:id" element={<AddEditShop />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="coupons/add" element={<AddEditCoupon />} />
          <Route path="coupons/edit/:id" element={<AddEditCoupon />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="offers/add" element={<AddEditOffer />} />
          <Route path="offers/edit/:id" element={<AddEditOffer />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;