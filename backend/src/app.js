const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { initializeRedis } = require('./utils/redis');
const supabase = require('./utils/supabase');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Route imports
const authRoutes = require('./controllers/auth.controller');
const dataSyncRoutes = require('./controllers/dataSync.controller');
const chatRoutes = require('./controllers/chat.controller');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data-sync', dataSyncRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected',
      server: 'running'
    }
  });
});

// Error handling
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-job', (jobId) => {
    socket.join(`job-${jobId}`);
    console.log(`Client ${socket.id} joined job room: job-${jobId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test Supabase connection
    const supabaseTest = await supabase.testConnection();
    if (supabaseTest.success) {
      console.log('✅ Supabase connected successfully');
    } else {
      console.warn('⚠️  Supabase connection failed:', supabaseTest.error);
      console.warn('⚠️  Database features will not work.');
    }
    
    // Initialize Redis connection
    try {
      await initializeRedis();
      console.log('✅ Redis connected successfully');
    } catch (redisError) {
      console.warn('⚠️  Redis connection failed:', redisError.message);
      console.warn('⚠️  Job queue features will not work.');
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`💾 Database: Supabase PostgreSQL`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👤 Test user: taneshpurohit09@gmail.com`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };