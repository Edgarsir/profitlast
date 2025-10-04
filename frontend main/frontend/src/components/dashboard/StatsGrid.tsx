import React from 'react';
import { Card } from '../ui/Card';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Orders',
    value: '2,350',
    change: '+180.1%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Products',
    value: '12,234',
    change: '+19%',
    changeType: 'positive',
    icon: Package,
  },
  {
    name: 'Active Users',
    value: '573',
    change: '+201',
    changeType: 'positive',
    icon: Users,
  },
];

export const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600">{stat.change} from last month</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};