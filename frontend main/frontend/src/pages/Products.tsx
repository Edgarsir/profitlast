import React from 'react';
import { Card } from '../components/ui/Card';

export const Products: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600">Manage your product catalog</p>
      </div>
      
      <Card>
        <p className="text-gray-500">Product management coming soon...</p>
      </Card>
    </div>
  );
};