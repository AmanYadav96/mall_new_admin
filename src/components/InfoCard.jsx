const InfoCard = ({ title, value, icon, color }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card stat-card h-100" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="card-title text-muted mb-0">{title}</h6>
            <i className={`bi ${icon} stat-icon`} style={{ color }}></i>
          </div>
          <h3 className="mb-0 fw-bold">{value}</h3>
          <div className="progress mt-3" style={{ height: '4px' }}>
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: '70%', backgroundColor: color }} 
              aria-valuenow="70" 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;