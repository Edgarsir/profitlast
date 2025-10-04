const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async testConnections() {
    return this.request('/auth/platforms/test');
  }

  // Data sync methods
  async startDataSync(platforms = ['shopify', 'meta', 'shiprocket']) {
    return this.request('/data-sync/start', {
      method: 'POST',
      body: JSON.stringify({ platforms }),
    });
  }

  async getSyncStatus(jobId: string) {
    return this.request(`/data-sync/status/${jobId}`);
  }

  async getSyncHistory() {
    return this.request('/data-sync/history');
  }

  // Chat methods
  async sendMessage(message: string, sessionId?: string) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  async getChatHistory() {
    return this.request('/chat/history');
  }

  async getChatSession(sessionId: string) {
    return this.request(`/chat/session/${sessionId}`);
  }
}

export const apiService = new ApiService();