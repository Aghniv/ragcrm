/**
 * Component Integration Examples
 * 
 * This file shows different ways to use the Sales Dashboard component
 * in your application.
 */

// ============================================================================
// EXAMPLE 1: Basic Usage (Recommended for new routes)
// ============================================================================

import React from 'react';
import { SalesDashboard } from '@/components/ui/live-sales-dashboard';

export const BasicDashboardPage = () => {
  return (
    <div>
      <SalesDashboard />
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Dashboard with Custom Layout
// ============================================================================

export const DashboardWithHeader = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-6">
        <h1 className="text-3xl font-bold">Sales Analytics</h1>
        <p className="text-sm opacity-90">Real-time sales tracking and analytics</p>
      </header>
      <SalesDashboard />
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Dashboard in a Modal/Dialog
// ============================================================================

export const DashboardModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Sales Dashboard</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-60px)]">
          <SalesDashboard />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Dashboard with Data Refresh Control
// ============================================================================

import { useState } from 'react';

export const DashboardWithControls = () => {
  const [refreshInterval, setRefreshInterval] = useState(4000);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center p-4 bg-muted rounded-lg">
        <label className="text-sm font-medium">Refresh Interval:</label>
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value={2000}>2 seconds</option>
          <option value={4000}>4 seconds</option>
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
        </select>
      </div>
      <SalesDashboard />
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Using the Data Hook Directly
// ============================================================================

import { useRealtimeSalesData } from '@/demos/hooks/useRealtimeSalesData';

export const CustomDashboard = () => {
  const {
    totalRevenue,
    salesCount,
    averageSale,
    latestPayments,
  } = useRealtimeSalesData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Custom Sales View</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-500">
            ${totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold">{salesCount}</p>
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-sm text-muted-foreground">Average Sale</p>
          <p className="text-2xl font-bold text-blue-400">
            ${averageSale?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {latestPayments?.slice(0, 5).map((payment) => (
            <div key={payment.id} className="flex justify-between p-3 bg-muted rounded">
              <span>{payment.product}</span>
              <span className="font-bold">${payment.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Dashboard with Tailwind Responsive Grid
// ============================================================================

export const ResponsiveDashboard = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Mobile: full width, Tablet: 2 columns, Desktop: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-1 lg:col-span-3">
          {/* Full width on desktop */}
          <SalesDashboard />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 7: Add to React Router (App.js)
// ============================================================================

/**
 * Add this to your App.js Routes:
 * 
 * import SalesDashboardPage from './pages/SalesDashboardPage';
 * 
 * <Route
 *   path="/sales-dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <SalesDashboardPage />
 *     </ProtectedRoute>
 *   }
 * />
 * 
 * Then add a link in your Navbar:
 * <Nav.Link href="/sales-dashboard">Sales Dashboard</Nav.Link>
 */

// ============================================================================
// EXAMPLE 8: Component Structure Overview
// ============================================================================

/**
 * Dashboard Component Hierarchy:
 * 
 * SalesDashboard (Main Container)
 * ├── Header Section
 * │   ├── Title
 * │   └── Description
 * ├── Metrics Grid
 * │   ├── MetricCard (Revenue)
 * │   ├── MetricCard (Transactions)
 * │   ├── MetricCard (Average Sale)
 * │   └── Card (Activity Status)
 * ├── Charts Section
 * │   ├── RealtimeChart (Sales per Second)
 * │   └── RealtimeChart (Cumulative Revenue)
 * └── Latest Payments Section
 *     ├── CardHeader
 *     ├── ScrollArea
 *     │   └── Payment Items (Dynamic List)
 *     └── CardFooter
 * 
 * All components use:
 * - Tailwind CSS for styling
 * - CSS Variables for theming
 * - Radix UI primitives for accessibility
 * - Lucide React for icons
 * - Recharts for data visualization
 */

// ============================================================================
// EXAMPLE 9: Styling with Tailwind CSS
// ============================================================================

/**
 * Common Tailwind Classes Used:
 * 
 * Layout:
 * - grid, grid-cols-*, gap-*
 * - flex, flex-col, flex-row, items-center, justify-between
 * - p-*, m-*, space-y-*
 * 
 * Colors (CSS Variables):
 * - bg-background, bg-card, bg-muted
 * - text-foreground, text-muted-foreground, text-primary
 * - border-border
 * 
 * Typography:
 * - text-3xl, text-2xl, text-sm
 * - font-bold, font-medium, font-semibold
 * 
 * Responsive:
 * - md:, lg:, xl: prefixes for breakpoints
 * 
 * Interactive:
 * - hover:, focus:, active:
 * - transition-*, duration-*
 * - animate-*
 */

// ============================================================================
// EXAMPLE 10: Type Definitions
// ============================================================================

/**
 * Key TypeScript Interfaces:
 * 
 * SaleDataPoint {
 *   time: string;           // Format: "HH:MM:SS"
 *   sales: number;          // Sales amount or cumulative
 * }
 * 
 * LatestPayment {
 *   id: string;
 *   amount: number;
 *   product: string;
 *   customer: string;
 *   time: string;           // Format: "HH:MM:SS"
 * }
 * 
 * UseRealtimeSalesDataReturn {
 *   totalRevenue: number;
 *   cumulativeRevenueData: SaleDataPoint[];
 *   salesCount: number;
 *   averageSale: number;
 *   salesChartData: SaleDataPoint[];
 *   latestPayments: LatestPayment[];
 * }
 */

export default BasicDashboardPage;
