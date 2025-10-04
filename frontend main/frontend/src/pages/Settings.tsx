import React from 'react';
import { Card } from '../components/ui/Card';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your dashboard</p>
      </div>
      
      <Card>
        <p className="text-gray-500">Settings panel coming soon...</p>
      </Card>
    </div>
  );
};