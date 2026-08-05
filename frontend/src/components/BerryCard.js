import React from 'react';

/**
 * Lightweight Berry-style card: white surface, soft border, optional accent
 * border on top, optional header with title/subtitle and a right-aligned
 * action slot.
 */
function BerryCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  bodyClassName = '',
  flush = false,
  hoverable = false,
}) {
  return (
    <div className={`berry-card ${hoverable ? 'hoverable' : ''} ${className}`.trim()}>
      {(title || action) && (
        <div className="berry-card-header">
          <div>
            {title && (
              <h3 className="berry-card-title">
                {icon}
                {title}
              </h3>
            )}
            {subtitle && <p className="berry-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`berry-card-body ${flush ? 'flush' : ''} ${bodyClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
}

export default BerryCard;
