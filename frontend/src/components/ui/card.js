// Lightweight Card primitives used by the dashboard. Mirrors the shadcn API
// (Card, CardHeader, CardTitle, CardContent, CardDescription) so we can drop
// the real shadcn/ui in later without changing call sites.
import React from 'react';

export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {} }) {
  return (
    <div className={`glass-card-header ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', style = {} }) {
  return (
    <h3 className={`glass-card-title ${className}`} style={style}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, style = {} }) {
  return (
    <p className="glass-card-desc" style={style}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', style = {} }) {
  return (
    <div className={`glass-card-body ${className}`} style={style}>
      {children}
    </div>
  );
}