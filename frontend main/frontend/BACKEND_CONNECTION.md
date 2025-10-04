# Backend Connection Guide

## 🔗 Frontend-Backend Connection Status

The frontend is **configured and ready** to connect with your backend. Here's what's set up:

### ✅ **API Configuration**
- **Frontend URL**: `http://localhost:5173` (Vite dev server)
- **Backend API**: `http://localhost:3000/api`
- **WebSocket**: `http://localhost:3000`

### ✅ **API Endpoints Implemented**
```typescript
// Authentication
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/platforms/test

// Data Sync
POST /api/data-sync/start
GET  /api/data-sync/status/:jobId
GET  /api/data-sync/history

// Chat
POST /api/chat
GET  /api/chat/history
GET  /api/chat/session/:sessionId
```

### ✅ **WebSocket Events**
```typescript
// Client emits
socket.emit('join-job', jobId)

// Server emits
socket.emit('progress', { jobId, progress, message })
socket.emit('error', { jobId, error })
```

## 🚀 **How to Test Connection**

1. **Start your backend server** on port 3000
2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Check the Dashboard** - You'll see a "Backend Connection" card that tests:
   - ✅ API Server connectivity
   - ✅ WebSocket connectivity

## 🔧 **Backend Requirements**

Your backend should have these endpoints for full functionality:

### **Health Check** (Optional but recommended)
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### **CORS Configuration**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## 🎯 **Complete User Flow**

1. **Login** → `POST /api/auth/login` → Get JWT token
2. **Start Sync** → `POST /api/data-sync/start` → Get jobId
3. **WebSocket** → Join room, receive progress updates
4. **Chat** → `POST /api/chat` → AI responses

## 🐛 **Troubleshooting**

### Connection Issues:
- Ensure backend is running on port 3000
- Check CORS configuration
- Verify API endpoints match the expected structure

### WebSocket Issues:
- Ensure Socket.IO is configured on backend
- Check for firewall blocking WebSocket connections
- Verify WebSocket events match expected names

## 📝 **Environment Variables**

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_NODE_ENV=development
```

The frontend is **ready to connect** - just start your backend server! 🚀