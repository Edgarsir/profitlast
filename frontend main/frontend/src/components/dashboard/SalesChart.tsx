import React from 'react';
import { Card } from '../ui/Card';
import { SimpleChart } from '../ui/SimpleChart';

const salesData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

export const SalesChart: React.FC = () => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
        <p className="text-sm text-gray-600">Monthly sales performance</p>
      </div>
      <SimpleChart data={salesData} height={320} color="#3b82f6" />
    </Card>
  );
};