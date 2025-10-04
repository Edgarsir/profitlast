import React from 'react';
import { Card } from '../components/ui/Card';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Detailed analytics and insights</p>
      </div>
      
      <Card>
        <p className="text-gray-500">Analytics dashboard coming soon...</p>
      </Card>
    </div>
  );
};