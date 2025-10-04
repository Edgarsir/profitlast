export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    SALES: '/dashboard/sales',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
  },
  SYNC: {
    STATUS: '/sync/status',
    TRIGGER: '/sync/trigger',
  },
  CHAT: {
    SESSIONS: '/chat/sessions',
    MESSAGES: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
  },
} as const;