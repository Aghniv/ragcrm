// Example page for using the Sales Dashboard
// Add this to your app routes or use as a reference

import React from 'react';
import { SalesDashboard } from '../components/ui/live-sales-dashboard';

/**
 * SalesDashboardPage Component
 * 
 * This page displays the live sales dashboard with real-time metrics and charts.
 * 
 * Integration Steps:
 * 1. Import this component in App.js
 * 2. Add a route for it:
 *    <Route path="/sales-dashboard" element={<ProtectedRoute><SalesDashboardPage /></ProtectedRoute>} />
 * 3. Add a link to the Navbar component
 * 4. Update the useRealtimeSalesData hook to fetch real data
 */
export const SalesDashboardPage: React.FC = () => {
  return <SalesDashboard />;
};

export default SalesDashboardPage;
