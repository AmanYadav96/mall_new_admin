import React from 'react';
import { useTranslation } from 'react-i18next';

const UserTable = ({ users }) => {
  const { t } = useTranslation();

  if (users.length === 0) {
    return (
      <div className="alert alert-info">
        {t('noUsersFound')}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>{t('name')}</th>
            <th>{t('email')}</th>
            <th>{t('role')}</th>
            <th>{t('mobileNumber')}</th>
            <th>{t('joinedDate')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="avatar me-2">
                    {user.profileImage && user.profileImage !== 'default.png' ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="rounded-circle"
                        width="40"
                        height="40"
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="fw-bold">{user.name}</div>
                  </div>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                  {user.role}
                </span>
              </td>
              <td>
                {user.mobileNumber || '-'}
              </td>
              <td>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;