import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DeleteConfirmation = ({ show, onClose, onConfirm, itemName, itemImage, itemType = 'item' }) => {
  const { t } = useTranslation();
  
  return (
    <Modal 
      show={show} 
      onHide={onClose}
      centered
      backdrop="static"
      className="delete-confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmDelete')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {itemImage && (
          <div className="mb-3">
            <img 
              src={itemImage} 
              alt={itemName} 
              className="img-thumbnail" 
              style={{ 
                maxHeight: '150px', 
                maxWidth: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg';
              }}
            />
          </div>
        )}
        <p>
          {t('Are you sure you want to delete', { 
            itemType: t(itemType), 
            itemName: itemName || t(itemType) 
          })}
        </p>
        <p className="text-danger fw-bold">{t(`${itemName}`)}</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t('delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmation;