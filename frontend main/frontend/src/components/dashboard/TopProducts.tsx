import React from 'react';
import { Card } from '../ui/Card';

const products = [
  { name: 'Wireless Headphones', sales: 1234, revenue: '$24,680' },
  { name: 'Smart Watch', sales: 987, revenue: '$19,740' },
  { name: 'Laptop Stand', sales: 756, revenue: '$15,120' },
  { name: 'USB-C Cable', sales: 654, revenue: '$6,540' },
];

export const TopProducts: React.FC = () => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <p className="text-sm text-gray-600">Best performing products this month</p>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-primary-600">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.sales} sales</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{product.revenue}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};