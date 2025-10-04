const dataSyncQueue = require('./dataSync.job');
const { connectDB } = require('../utils/database');
const { initializeRedis } = require('../utils/redis');
require('dotenv').config();

async function startWorker() {
  try {
    console.log('Starting data sync worker...');
    
    // Initialize database and Redis connections
    await connectDB();
    await initializeRedis();
    
    console.log('Worker initialized successfully');
    console.log('Waiting for jobs...');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await dataSyncQueue.close();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      await dataSyncQueue.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();