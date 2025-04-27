import { useTranslation } from 'react-i18next';

const DeleteConfirmation = ({ show, onClose, onConfirm, itemName }) => {
  const { t } = useTranslation();
  
  if (!show) return null;
  
  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('confirmDelete')}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              {t('confirmDelete')} {itemName ? `"${itemName}"` : ''}?
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default DeleteConfirmation;