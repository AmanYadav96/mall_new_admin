import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import InfoCard from '../components/InfoCard';
import axios from 'axios'; // Add axios import

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0,
    malls: 0,
    shops: 0,
    coupons: 0,
    offers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({
    shopsByMall: null,
    offersOverTime: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the auth token from localStorage
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const token = adminUser.token;
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Make the API request with the token in the header
        const response = await axios.get('https://mall-backend-node.vercel.app/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Update state with the response data
        if (response.data && response.data.success) {
          const dashboardData = response.data.data;
          
          // Update stats
          setStats({
            users: dashboardData.totalUsers || 0,
            malls: dashboardData.totalMalls || 0,
            shops: dashboardData.totalShops || 0,
            coupons: dashboardData.totalCoupons || 0,
            offers: dashboardData.totalOffers || 0
          });
          
          // Update recent activity if available
          if (response.data.recentActivity) {
            setRecentActivity(response.data.recentActivity);
          }
          
          // Create chart data from mallsWithShops
          if (dashboardData.mallsWithShops && dashboardData.mallsWithShops.length > 0) {
            // Prepare shops by mall chart data
            const mallNames = dashboardData.mallsWithShops.map(mall => mall.name);
            const shopCounts = dashboardData.mallsWithShops.map(mall => mall.shopCount);
            
            setChartData(prevData => ({
              ...prevData,
              shopsByMall: {
                labels: mallNames,
                datasets: [
                  {
                    label: t('shops'),
                    data: shopCounts,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                  }
                ]
              }
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Prepare chart data
  const shopsByMallData = chartData.shopsByMall || {
    labels: ['Central Mall', 'City Center', 'Plaza Mall', 'Fashion Mall', 'Grand Mall'],
    datasets: [
      {
        label: t('shops'),
        data: [42, 35, 27, 32, 18],
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 1
      }
    ]
  };

  const offersOverTimeData = chartData.offersOverTime || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: t('offers'),
        data: [12, 19, 15, 22, 30, 25],
        borderColor: 'rgba(32, 201, 151, 1)',
        backgroundColor: 'rgba(32, 201, 151, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        label: t('coupons'),
        data: [8, 15, 12, 18, 25, 20],
        borderColor: 'rgba(253, 126, 20, 1)',
        backgroundColor: 'rgba(253, 126, 20, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Default recent activity if API doesn't provide it
  const defaultRecentActivity = [
    { id: 1, type: 'mall', action: 'added', title: 'Garden Mall', time: '2 hours ago' },
    { id: 2, type: 'shop', action: 'updated', title: 'Fashion Store', time: '3 hours ago' },
    { id: 3, type: 'coupon', action: 'added', title: 'Summer Sale 20%', time: '5 hours ago' },
    { id: 4, type: 'user', action: 'registered', title: 'John Doe', time: '1 day ago' },
    { id: 5, type: 'offer', action: 'expired', title: 'Weekend Discount', time: '1 day ago' }
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading dashboard</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  // Icons for stats cards
  const statIcons = {
    users: 'bi-people',
    malls: 'bi-building',
    shops: 'bi-shop',
    coupons: 'bi-ticket-perforated',
    offers: 'bi-percent'
  };

  // Colors for stats cards
  const statColors = {
    users: '#0d6efd',
    malls: '#20c997',
    shops: '#fd7e14',
    coupons: '#dc3545',
    offers: '#6f42c1'
  };

  // Use API data or fallback to default
  const activityData = recentActivity.length > 0 ? recentActivity : defaultRecentActivity;

  return (
    <div className="dashboard fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('dashboard')}</h4>
        <div className="d-flex">
          <button className="btn btn-sm btn-outline-secondary me-2">
            <i className="bi bi-download me-2"></i>
            Export
          </button>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Rest of the component remains the same, but use activityData instead of recentActivity */}
      {/* Stats Cards */}
      <div className="row dashboard-stats mb-4">
        <InfoCard 
          title={t('totalUsers')} 
          value={stats.users} 
          icon={statIcons.users} 
          color={statColors.users} 
        />
        <InfoCard 
          title={t('totalMalls')} 
          value={stats.malls} 
          icon={statIcons.malls} 
          color={statColors.malls} 
        />
        <InfoCard 
          title={t('totalShops')} 
          value={stats.shops} 
          icon={statIcons.shops} 
          color={statColors.shops} 
        />
        <InfoCard 
          title={t('totalCoupons')} 
          value={stats.coupons} 
          icon={statIcons.coupons} 
          color={statColors.coupons} 
        />
        <InfoCard 
          title={t('totalOffers')} 
          value={stats.offers} 
          icon={statIcons.offers} 
          color={statColors.offers} 
        />
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">{t('shops')} {t('by')} {t('mall')}</h6>
            </div>
            <div className="card-body">
              <Bar data={shopsByMallData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">{t('offers')} & {t('coupons')} {t('over')} {t('time')}</h6>
            </div>
            <div className="card-body">
              <Line data={offersOverTimeData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{t('recentActivity')}</h6>
              <button className="btn btn-sm btn-link">{t('viewAll')}</button>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {activityData.map(activity => (
                  <li key={activity.id} className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="avatar-icon me-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: 
                            activity.type === 'mall' ? 'rgba(32, 201, 151, 0.2)' :
                            activity.type === 'shop' ? 'rgba(253, 126, 20, 0.2)' :
                            activity.type === 'coupon' ? 'rgba(220, 53, 69, 0.2)' :
                            activity.type === 'offer' ? 'rgba(111, 66, 193, 0.2)' :
                            'rgba(13, 110, 253, 0.2)'
                        }}
                      >
                        <i className={`bi ${
                          activity.type === 'mall' ? 'bi-building' :
                          activity.type === 'shop' ? 'bi-shop' :
                          activity.type === 'coupon' ? 'bi-ticket-perforated' :
                          activity.type === 'offer' ? 'bi-percent' :
                          'bi-person'
                        }`} style={{ 
                          color: 
                            activity.type === 'mall' ? '#20c997' :
                            activity.type === 'shop' ? '#fd7e14' :
                            activity.type === 'coupon' ? '#dc3545' :
                            activity.type === 'offer' ? '#6f42c1' :
                            '#0d6efd'
                        }}></i>
                      </div>
                      <div>
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{activity.title}</h6>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <p className="mb-0 text-muted small">
                          {activity.action === 'added' && `${t(activity.type)} was created`}
                          {activity.action === 'updated' && `${t(activity.type)} was updated`}
                          {activity.action === 'expired' && `${t(activity.type)} has expired`}
                          {activity.action === 'registered' && 'New user registered'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">{t('quickActions')}</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/malls/add" className="btn btn-outline-primary">
                  <i className="bi bi-building me-2"></i>
                  {t('addNewMall')}
                </Link>
                <Link to="/shops/add" className="btn btn-outline-primary">
                  <i className="bi bi-shop me-2"></i>
                  {t('addNewShop')}
                </Link>
                <Link to="/coupons/add" className="btn btn-outline-primary">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  {t('addNewCoupon')}
                </Link>
                <Link to="/offers/add" className="btn btn-outline-primary">
                  <i className="bi bi-percent me-2"></i>
                  {t('addNewOffer')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;