import { useState, useEffect } from 'react';

export interface SaleDataPoint {
  time: string;
  sales: number;
}

export interface LatestPayment {
  id: string;
  amount: number;
  product: string;
  customer: string;
  time: string;
}

export interface UseRealtimeSalesDataReturn {
  totalRevenue: number;
  cumulativeRevenueData: SaleDataPoint[];
  salesCount: number;
  averageSale: number;
  salesChartData: SaleDataPoint[];
  latestPayments: LatestPayment[];
}

// Mock data generator
const generateMockSalesData = (): UseRealtimeSalesDataReturn => {
  const now = new Date();
  const salesDataPoints: SaleDataPoint[] = [];
  const cumulativeRevenuePoints: SaleDataPoint[] = [];
  const latestPayments: LatestPayment[] = [];

  let cumulativeRevenue = 0;
  const products = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones'];
  const customers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];

  // Generate last 30 data points (2 minutes worth at 4-second intervals)
  for (let i = 29; i >= 0; i--) {
    const pointTime = new Date(now.getTime() - i * 4000);
    const hours = String(pointTime.getHours()).padStart(2, '0');
    const minutes = String(pointTime.getMinutes()).padStart(2, '0');
    const seconds = String(pointTime.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const saleAmount = Math.floor(Math.random() * 500) + 50;
    salesDataPoints.push({
      time: timeStr,
      sales: saleAmount,
    });

    cumulativeRevenue += saleAmount;
    cumulativeRevenuePoints.push({
      time: timeStr,
      sales: cumulativeRevenue,
    });
  }

  // Generate latest payments
  for (let i = 0; i < 10; i++) {
    const paymentTime = new Date(now.getTime() - i * 5000);
    const hours = String(paymentTime.getHours()).padStart(2, '0');
    const minutes = String(paymentTime.getMinutes()).padStart(2, '0');
    const seconds = String(paymentTime.getSeconds()).padStart(2, '0');

    latestPayments.push({
      id: `payment-${i}`,
      amount: Math.floor(Math.random() * 1000) + 50,
      product: products[Math.floor(Math.random() * products.length)],
      customer: customers[Math.floor(Math.random() * customers.length)],
      time: `${hours}:${minutes}:${seconds}`,
    });
  }

  const totalRevenue = cumulativeRevenue;
  const salesCount = salesDataPoints.length;
  const averageSale = totalRevenue / salesCount;

  return {
    totalRevenue,
    cumulativeRevenueData: cumulativeRevenuePoints,
    salesCount,
    averageSale,
    salesChartData: salesDataPoints,
    latestPayments,
  };
};

export const useRealtimeSalesData = (): UseRealtimeSalesDataReturn => {
  const [data, setData] = useState<UseRealtimeSalesDataReturn>(generateMockSalesData());

  useEffect(() => {
    // Update data every 4 seconds to simulate real-time data
    const interval = setInterval(() => {
      setData(generateMockSalesData());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return data;
};
