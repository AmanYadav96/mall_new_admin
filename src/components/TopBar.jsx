import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TopBar = ({ toggleSidebar, changeLanguage, currentLang }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(3); // Mock notification count

  return (
    <div className="top-bar d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <button className="btn toggle-sidebar me-2" onClick={toggleSidebar}>
          <i className="bi bi-list fs-5"></i>
        </button>
        <h5 className="mb-0 animate-entry">{t('adminPanel')}</h5>
      </div>
      
      <div className="d-flex align-items-center">
        <div className="dropdown me-3">
          <button 
            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
            type="button" 
            id="languageDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            {currentLang === 'en' ? t('english') : t('hebrew')}
          </button>
          <ul className="dropdown-menu" aria-labelledby="languageDropdown">
            <li><button className="dropdown-item" onClick={() => changeLanguage('en')}>English</button></li>
            <li><button className="dropdown-item" onClick={() => changeLanguage('he')}>עברית</button></li>
          </ul>
        </div>
        
        <div className="dropdown me-3">
          <button 
            className="btn position-relative" 
            type="button" 
            id="notificationsDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i className="bi bi-bell"></i>
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </button>
          <div className="dropdown-menu dropdown-menu-end p-0" aria-labelledby="notificationsDropdown" style={{width: '300px'}}>
            <div className="p-2 border-bottom">
              <h6 className="m-0">{t('notifications')}</h6>
            </div>
            <div className="p-2">
              <div className="notification-item p-2 border-bottom">
                <p className="small mb-1 text-muted">10 min ago</p>
                <p className="mb-0">New mall "City Center" was added</p>
              </div>
              <div className="notification-item p-2 border-bottom">
                <p className="small mb-1 text-muted">30 min ago</p>
                <p className="mb-0">New shop "Fashion Store" was added</p>
              </div>
              <div className="notification-item p-2">
                <p className="small mb-1 text-muted">1 hour ago</p>
                <p className="mb-0">User John Doe updated his profile</p>
              </div>
            </div>
            <div className="p-2 border-top text-center">
              <button className="btn btn-sm btn-link">{t('viewAll')}</button>
            </div>
          </div>
        </div>
        
        <div className="dropdown">
          <button 
            className="btn d-flex align-items-center" 
            type="button" 
            id="userDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <img 
              src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg" 
              alt="Profile" 
              className="avatar me-2" 
              width="32" 
              height="32" 
            />
            <span className="d-none d-md-block">Admin User</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a className="dropdown-item" href="/profile"><i className="bi bi-person me-2"></i>{t('profile')}</a></li>
            <li><a className="dropdown-item" href="/profile"><i className="bi bi-gear me-2"></i>{t('settings')}</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-box-arrow-right me-2"></i>{t('logout')}</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopBar;