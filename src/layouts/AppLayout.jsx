import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const AppLayout = ({ changeLanguage, currentLang }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isRTL = currentLang === 'he';

  return (
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} currentLang={currentLang} />
      <div className={`flex-grow-1 ${sidebarOpen ? '' : 'sidebar-collapsed'}`} style={{ 
        marginLeft: isRTL ? 0 : (sidebarOpen ? '250px' : '70px'),
        marginRight: isRTL ? (sidebarOpen ? '250px' : '70px') : 0,
        transition: 'all 0.3s ease'
      }}>
        <TopBar 
          toggleSidebar={toggleSidebar} 
          changeLanguage={changeLanguage} 
          currentLang={currentLang} 
        />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;