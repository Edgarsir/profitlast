import { apiService } from '../services/api';

export const testBackendConnection = async () => {
  const results = {
    api: false,
    websocket: false,
    errors: [] as string[],
  };

  // Test API connection
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/health`);
    results.api = response.ok;
    if (!response.ok) {
      results.errors.push(`API Health Check Failed: ${response.status}`);
    }
  } catch (error: any) {
    results.errors.push(`API Connection Error: ${error.message}`);
  }

  // Test WebSocket connection
  try {
    const { io } = await import('socket.io-client');
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      timeout: 5000,
    });

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        results.websocket = true;
        socket.disconnect();
        resolve(true);
      });

      socket.on('connect_error', (error) => {
        results.errors.push(`WebSocket Error: ${error.message}`);
        reject(error);
      });

      setTimeout(() => {
        if (!socket.connected) {
          results.errors.push('WebSocket connection timeout');
          socket.disconnect();
          reject(new Error('Timeout'));
        }
      }, 5000);
    });
  } catch (error: any) {
    results.errors.push(`WebSocket Connection Error: ${error.message}`);
  }

  return results;
};

export const testAuthFlow = async (email: string, password: string) => {
  try {
    const response = await apiService.login(email, password);
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const testDataSyncFlow = async () => {
  try {
    const response = await apiService.startDataSync(['shopify', 'meta', 'shiprocket']);
    return { success: true, jobId: response.jobId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const testChatFlow = async (message: string) => {
  try {
    const response = await apiService.sendMessage(message);
    return { success: true, response: response.response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};