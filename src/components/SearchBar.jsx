import { useState, useEffect, useRef } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const initialRender = useRef(true);
  
  useEffect(() => {
    // Skip the first render to prevent unnecessary search on component mount
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    const debounceTimeout = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchTerm, onSearch]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-bar">
      <div className="input-group">
        <span className="input-group-text bg-light border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;