import { useState } from 'react';
import { apiService } from '../services/api';
import { useSocket } from './useWebSocket';

export const useDataSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const { joinJobRoom, onProgress, onError } = useSocket();

  const startSync = async (platforms: string[] = ['shopify', 'meta', 'shiprocket']) => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      setStatus('Starting sync...');

      const response = await apiService.startDataSync(platforms);
      const jobId = response.jobId;

      // Store jobId for reference
      localStorage.setItem('syncJobId', jobId);

      // Join WebSocket room for real-time updates
      joinJobRoom(jobId);

      // Listen for progress updates
      onProgress((data: any) => {
        if (data.jobId === jobId) {
          setProgress(data.progress);
          setStatus(data.message);
          if (data.progress === 100) {
            setResults(data.results);
            setIsLoading(false);
            localStorage.removeItem('syncJobId');
          }
        }
      });

      // Listen for errors
      onError((data: any) => {
        if (data.jobId === jobId) {
          setError(data.error);
          setIsLoading(false);
          localStorage.removeItem('syncJobId');
        }
      });

      return jobId;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    startSync,
    isLoading,
    progress,
    status,
    error,
    results,
  };
};