import React from 'react';
import { Card } from '../components/ui/Card';

export const Orders: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Track and manage orders</p>
      </div>
      
      <Card>
        <p className="text-gray-500">Order management coming soon...</p>
      </Card>
    </div>
  );
};