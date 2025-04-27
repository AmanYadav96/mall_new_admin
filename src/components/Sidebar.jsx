import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`} 
         style={{ width: isOpen ? '250px' : '70px' }}>
      <div className="d-flex align-items-center mb-4 px-3 py-3">
        <div className="logo-icon bg-primary text-white d-flex align-items-center justify-content-center rounded" 
             style={{ width: '40px', height: '40px', minWidth: '40px' }}>
          <i className="bi bi-building"></i>
        </div>
        {isOpen && (
          <div className="ms-3 logo-text">
            <h5 className="mb-0 fw-bold">{t('adminPanel')}</h5>
          </div>
        )}
      </div>

      <ul className="sidebar-nav nav flex-column px-2">
        <li className="nav-item mb-2">
          <NavLink to="/dashboard" className="nav-link">
            <i className="bi bi-speedometer2"></i>
            {isOpen && <span className="nav-text ms-2">{t('dashboard')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink to="/users" className="nav-link">
            <i className="bi bi-people"></i>
            {isOpen && <span className="nav-text ms-2">{t('users')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink to="/malls" className="nav-link">
            <i className="bi bi-building"></i>
            {isOpen && <span className="nav-text ms-2">{t('malls')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink to="/shops" className="nav-link">
            <i className="bi bi-shop"></i>
            {isOpen && <span className="nav-text ms-2">{t('shops')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink to="/coupons" className="nav-link">
            <i className="bi bi-ticket-perforated"></i>
            {isOpen && <span className="nav-text ms-2">{t('coupons')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink to="/offers" className="nav-link">
            <i className="bi bi-percent"></i>
            {isOpen && <span className="nav-text ms-2">{t('offers')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink to="/profile" className="nav-link">
            <i className="bi bi-person-circle"></i>
            {isOpen && <span className="nav-text ms-2">{t('profile')}</span>}
          </NavLink>
        </li>
        <li className="nav-item mt-4">
          <button onClick={handleLogout} className="nav-link bg-transparent border-0 text-danger w-100">
            <i className="bi bi-box-arrow-right"></i>
            {isOpen && <span className="nav-text ms-2">{t('logout')}</span>}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;