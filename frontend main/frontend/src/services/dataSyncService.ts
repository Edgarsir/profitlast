import { apiService } from './api';

export const dataSyncService = {
  async startSync() {
    return apiService.startDataSync();
  },

  async getSyncStatus(jobId: string) {
    return apiService.getSyncStatus(jobId);
  },

  async getSyncHistory() {
    return apiService.getSyncHistory();
  },
};