# Backend API Endpoints

Your backend is running on `http://localhost:3000` with the following endpoints:

## 🏥 Health Check
```
GET /health
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected", 
    "server": "running"
  }
}
```

## 🔐 Authentication Endpoints

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "taneshpurohit09@gmail.com",
  "password": "your_password"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "Tanesh",
    "lastName": "Purohit",
    "email": "taneshpurohit09@gmail.com",
    "platforms": {
      "shopify": { "connected": true, "storeUrl": "e23104-8c.myshopify.com" },
      "meta": { "connected": true, "adAccountId": "1009393717108101" },
      "shiprocket": { "connected": true, "email": "taneshpurohit2004@gmail.com" }
    }
  }
}
```

### Get User Profile
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
```

### Test Platform Connections
```
GET /api/auth/platforms/test
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "shopify": { "success": true, "shop": {...} },
  "meta": { "success": true, "user": {...} },
  "shiprocket": { "success": true, "data": {...} }
}
```

## 🔄 Data Sync Endpoints

### Start Data Sync
```
POST /api/data-sync/start
Headers: Authorization: Bearer {token}
```
**Body:**
```json
{
  "platforms": ["shopify", "meta", "shiprocket"]
}
```
**Response:**
```json
{
  "message": "Data sync job started",
  "jobId": "uuid-job-id",
  "status": "queued",
  "platforms": ["shopify", "meta", "shiprocket"]
}
```

### Get Sync Status
```
GET /api/data-sync/status/{jobId}
Headers: Authorization: Bearer {token}
```

### Get Sync History
```
GET /api/data-sync/history
Headers: Authorization: Bearer {token}
```

### Sync Specific Platform
```
POST /api/data-sync/platform/{platform}
Headers: Authorization: Bearer {token}
```
Where `{platform}` is one of: `shopify`, `meta`, `shiprocket`

## 💬 Chat Endpoints

### Send Message
```
POST /api/chat
Headers: Authorization: Bearer {token}
```
**Body:**
```json
{
  "message": "What were my top selling products last month?",
  "sessionId": "optional-session-id"
}
```
**Response:**
```json
{
  "sessionId": "session-uuid",
  "response": "Based on your data, your top selling products were...",
  "metadata": {
    "processingTime": 1500,
    "tokensUsed": 150,
    "queryType": "analytics"
  }
}
```

### Streaming Chat
```
POST /api/chat/stream
Headers: Authorization: Bearer {token}
```
Returns Server-Sent Events (SSE) for real-time streaming responses.

### Get Chat History
```
GET /api/chat/history
Headers: Authorization: Bearer {token}
```

### Get Specific Chat Session
```
GET /api/chat/session/{sessionId}
Headers: Authorization: Bearer {token}
```

## 🔌 WebSocket Events

Connect to: `http://localhost:3000`

### Events to Emit:
- `join-job` - Join a specific job room for progress updates
  ```javascript
  socket.emit('join-job', jobId);
  ```

### Events to Listen:
- `progress` - Real-time sync progress updates
  ```javascript
  socket.on('progress', (data) => {
    // data.jobId, data.progress, data.message
  });
  ```
- `error` - Sync error notifications
  ```javascript
  socket.on('error', (data) => {
    // data.jobId, data.error
  });
  ```

## 🚀 Quick Test Commands

### Test Health
```bash
curl http://localhost:3000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taneshpurohit09@gmail.com","password":"your_password"}'
```

### Test Data Sync (with token)
```bash
curl -X POST http://localhost:3000/api/data-sync/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"platforms":["shopify","meta","shiprocket"]}'
```

## 📋 Frontend Integration Checklist

- ✅ Install `socket.io-client` for WebSocket connections
- ✅ Set up API service with JWT token management
- ✅ Create login component with email/password
- ✅ Implement data sync with progress tracking
- ✅ Build chat interface with real-time responses
- ✅ Add error handling for all API calls
- ✅ Store JWT token in localStorage
- ✅ Handle token expiration and refresh

## 🔧 Environment Variables for Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Your backend is fully ready for frontend integration! 🎉