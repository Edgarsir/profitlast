import React from 'react';
import { Card } from '../ui/Card';

const orders = [
  { id: '#3210', customer: 'John Doe', amount: '$299.00', status: 'completed' },
  { id: '#3209', customer: 'Jane Smith', amount: '$199.00', status: 'processing' },
  { id: '#3208', customer: 'Bob Johnson', amount: '$399.00', status: 'shipped' },
  { id: '#3207', customer: 'Alice Brown', amount: '$149.00', status: 'pending' },
];

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  pending: 'bg-gray-100 text-gray-800',
};

export const RecentOrders: React.FC = () => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <p className="text-sm text-gray-600">Latest customer orders</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};