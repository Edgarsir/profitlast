import React from 'react';
import { Button } from '../ui/Button';
import { RotateCw as Sync } from 'lucide-react';
import { useDataSync } from '../../hooks/useDataSync';

export const SyncButton: React.FC = () => {
  const { startSync, isLoading } = useDataSync();

  const handleStartSync = async () => {
    try {
      await startSync(['shopify', 'meta', 'shiprocket']);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <Button 
      onClick={handleStartSync} 
      loading={isLoading}
      className="flex items-center space-x-2"
    >
      <Sync className="h-4 w-4" />
      <span>{isLoading ? 'Syncing...' : 'Start Data Sync'}</span>
    </Button>
  );
};