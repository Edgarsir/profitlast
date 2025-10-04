import React from 'react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { SalesChart } from '../components/dashboard/SalesChart';
import { TopProducts } from '../components/dashboard/TopProducts';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { SyncButton } from '../components/data-sync/SyncButton';
import { SyncProgress } from '../components/data-sync/SyncProgress';
import { ConnectionTest } from '../components/ConnectionTest';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your ecommerce AI dashboard</p>
        </div>
        <SyncButton />
      </div>
      
      <ConnectionTest />
      
      <SyncProgress />
      
      <StatsGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProducts />
      </div>
      
      <RecentOrders />
    </div>
  );
};