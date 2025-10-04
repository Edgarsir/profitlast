export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SyncStatus {
  platform: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  error?: string;
}