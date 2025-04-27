import React from 'react';
import { useTranslation } from 'react-i18next';

const UserFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const handleRoleChange = (e) => {
    onFilterChange({ role: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      role: '',
      status: ''
    });
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder={t('searchUsers')}
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.role}
              onChange={handleRoleChange}
            >
              <option value="">{t('allRoles')}</option>
              <option value="admin">{t('admin')}</option>
              <option value="user">{t('user')}</option>
              <option value="manager">{t('manager')}</option>
            </select>
          </div>
          <div className="col-md-3">
            {/* <select
              className="form-select"
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select> */}
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={handleClearFilters}
            >
              {t('clearFilters')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;