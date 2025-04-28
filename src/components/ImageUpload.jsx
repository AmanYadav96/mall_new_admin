import { useState, useRef, useEffect } from 'react';

const ImageUpload = ({ initialImage, onImageChange }) => {
  const [previewUrl, setPreviewUrl] = useState(initialImage || '');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the selected image
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);

    // Pass the actual File object to the parent component
    onImageChange(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (initialImage) {
      console.log('Setting preview from initialImage:', initialImage);
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  return (
    <div className="image-upload">
      <div 
        className="image-preview" 
        onClick={handleClick}
        style={{ 
          cursor: 'pointer',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          padding: '10px',
          textAlign: 'center'
        }}
      >
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px',
              objectFit: 'contain'
            }} 
            onError={(e) => {
              console.log('Image failed to load:', previewUrl);
              e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found';
            }}
          />
        ) : (
          <div className="upload-placeholder">
            <i className="bi bi-cloud-upload" style={{ fontSize: '2rem' }}></i>
            <p>Click to upload an image</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload;