import React from 'react';

export function SkeletonTable() {
  return (
    <div className="leads-table-container">
      <table className="leads-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Source</th>
            <th>Status</th>
            <th>Score</th>
            <th>Urgency</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td><div className="skeleton" style={{ width: '120px', height: '20px' }} /></td>
              <td><div className="skeleton" style={{ width: '180px', height: '20px' }} /></td>
              <td><div className="skeleton" style={{ width: '100px', height: '20px' }} /></td>
              <td><div className="skeleton" style={{ width: '80px', height: '20px' }} /></td>
              <td><div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '12px' }} /></td>
              <td><div className="skeleton" style={{ width: '50px', height: '20px' }} /></td>
              <td><div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }} /></td>
              <td><div className="skeleton" style={{ width: '120px', height: '32px' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '40%', height: '16px' }} />
    </div>
  );
}

export default SkeletonTable;