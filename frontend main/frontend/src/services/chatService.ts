import { apiService } from './api';

export const chatService = {
  async sendMessage(message: string, sessionId?: string) {
    return apiService.sendMessage(message, sessionId);
  },

  async getChatSessions() {
    return apiService.getChatHistory();
  },

  async getChatMessages(sessionId: string) {
    return apiService.getChatSession(sessionId);
  },
};