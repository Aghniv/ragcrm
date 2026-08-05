import React from 'react';

/**
 * Berry-style stat tile: 3px accent bar on top, uppercase label, large value,
 * optional icon on the right, optional hint line.
 *
 * @param {string} label        - small uppercase label above the value
 * @param {string|number} value - main number to display
 * @param {ReactNode} icon      - lucide-react icon to render top-right
 * @param {string} accent       - CSS color / hex (defaults to --primary)
 * @param {string} hint         - optional small caption below the value
 */
function StatCard({ label, value, icon, accent = '#5e35d1', hint }) {
  // Tint the icon background with the accent at low opacity.
  const iconBg = `${accent}1a`; // ~10% opacity hex
  return (
    <div className="stat-card" style={{ '--accent': accent, '--accent-bg': iconBg }}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && (
          <span className="stat-card-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {hint && <div className="stat-card-hint">{hint}</div>}
    </div>
  );
}

export default StatCard;
