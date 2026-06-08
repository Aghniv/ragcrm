import React, { useState } from 'react';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  const [jumpPage, setJumpPage] = useState('');

  const handleJumpToPage = () => {
    const page = parseInt(jumpPage, 10);
    if (page > 0 && page <= totalPages) {
      onPageChange(page - 1);
      setJumpPage('');
    }
  };

  return (
    <div className="pagination-controls">
      <button
        className="btn-pagination"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        ← Previous
      </button>

      <div className="pagination-info">
        Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
      </div>

      <button
        className="btn-pagination"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next →
      </button>

      <div className="pagination-jump">
        <input
          type="number"
          min="1"
          max={totalPages}
          placeholder="Jump to page..."
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
          className="jump-input"
        />
        <button
          className="btn-jump"
          onClick={handleJumpToPage}
          disabled={!jumpPage}
        >
          Go
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
