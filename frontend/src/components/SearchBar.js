import React, { useState, useCallback, useEffect } from 'react';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by name, company, or email..."
        value={searchTerm}
        onChange={handleInputChange}
        className="search-input"
      />
      {searchTerm && (
        <button className="btn-clear" onClick={handleClear} title="Clear search">
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
