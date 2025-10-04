import React from 'react';
import { Card } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { useDataSync } from '../../hooks/useDataSync';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const SyncProgress: React.FC = () => {
  const { isLoading, progress, status, error, results } = useDataSync();

  if (!isLoading && !error && !results) {
    return null;
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Synchronization</h3>
        <p className="text-sm text-gray-600">Real-time synchronization status</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Loader className="h-5 w-5 text-blue-500 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{status}</p>
              <p className="text-sm text-gray-600">{progress}% Complete</p>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Sync Failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-800">Sync Complete</p>
              <p className="text-sm text-green-600">Data synchronization finished successfully</p>
            </div>
          </div>
          
          {results && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Sync Results:</h4>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};