import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, XCircle, Loader, Wifi } from 'lucide-react';
// Connection test component

interface ConnectionStatus {
  api: 'checking' | 'connected' | 'error';
  websocket: 'checking' | 'connected' | 'error';
  message?: string;
}

export const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    api: 'checking',
    websocket: 'checking',
  });

  const testApiConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, api: 'checking' }));
      
      // Test a simple endpoint (you might need to create a health check endpoint)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/health`);
      
      if (response.ok) {
        setStatus(prev => ({ ...prev, api: 'connected', message: 'API connection successful' }));
      } else {
        setStatus(prev => ({ ...prev, api: 'error', message: `API error: ${response.status}` }));
      }
    } catch (error: any) {
      setStatus(prev => ({ 
        ...prev, 
        api: 'error', 
        message: `API connection failed: ${error.message}` 
      }));
    }
  };

  const testWebSocketConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, websocket: 'checking' }));
      
      const { io } = await import('socket.io-client');
      const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
      
      socket.on('connect', () => {
        setStatus(prev => ({ ...prev, websocket: 'connected' }));
        socket.disconnect();
      });

      socket.on('connect_error', (error) => {
        setStatus(prev => ({ 
          ...prev, 
          websocket: 'error', 
          message: `WebSocket error: ${error.message}` 
        }));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (socket.connected) {
          socket.disconnect();
        } else {
          setStatus(prev => ({ 
            ...prev, 
            websocket: 'error', 
            message: 'WebSocket connection timeout' 
          }));
        }
      }, 5000);

    } catch (error: any) {
      setStatus(prev => ({ 
        ...prev, 
        websocket: 'error', 
        message: `WebSocket failed: ${error.message}` 
      }));
    }
  };

  const runTests = () => {
    testApiConnection();
    testWebSocketConnection();
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
      default:
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'checking':
      default:
        return 'text-blue-700';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wifi className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Backend Connection</h3>
        </div>
        <Button onClick={runTests} size="sm" variant="outline">
          Test Again
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.api)}
            <div>
              <p className="font-medium text-gray-900">API Server</p>
              <p className="text-sm text-gray-600">
                {import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}
              </p>
            </div>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(status.api)}`}>
            {status.api === 'checking' ? 'Testing...' : status.api}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.websocket)}
            <div>
              <p className="font-medium text-gray-900">WebSocket</p>
              <p className="text-sm text-gray-600">
                {import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'}
              </p>
            </div>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(status.websocket)}`}>
            {status.websocket === 'checking' ? 'Testing...' : status.websocket}
          </span>
        </div>
      </div>

      {status.message && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">{status.message}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Expected Backend:</strong> Node.js server running on port 3000</p>
        <p><strong>Required Endpoints:</strong> /api/auth/login, /api/data-sync/start, /api/chat</p>
        <p><strong>WebSocket Events:</strong> join-job, progress, error</p>
      </div>
    </Card>
  );
};