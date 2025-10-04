const express = require('express');
const Bull = require('bull');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { getRedisClient } = require('../utils/redis');

const router = express.Router();

// Create job queue
const dataSyncQueue = new Bull('data sync', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD
  }
});

// Start data sync job
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { platforms = ['shopify', 'meta', 'shiprocket'] } = req.body;
    const jobId = uuidv4();
    
    // Create job with user data and selected platforms
    const job = await dataSyncQueue.add('syncData', {
      userId: req.user._id,
      platforms: platforms,
      userCredentials: {
        shopify: {
          storeUrl: req.user.onboarding?.step2?.storeUrl,
          accessToken: req.user.onboarding?.step2?.accessToken,
          isConnected: !!req.user.onboarding?.step2?.accessToken
        },
        meta: {
          accessToken: req.user.onboarding?.step4?.accessToken,
          adAccountId: req.user.onboarding?.step4?.adAccountId,
          isConnected: !!req.user.onboarding?.step4?.accessToken
        },
        shiprocket: {
          email: req.user.onboarding?.step5?.email,
          password: req.user.onboarding?.step5?.password,
          token: req.user.onboarding?.step5?.token,
          isConnected: !!req.user.onboarding?.step5?.token
        }
      }
    }, {
      jobId: jobId,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    res.status(202).json({
      message: 'Data sync job started',
      jobId: jobId,
      status: 'queued',
      platforms: platforms
    });
  } catch (error) {
    console.error('Error starting data sync:', error);
    res.status(500).json({ error: 'Failed to start data sync job' });
  }
});

// Get job status
router.get('/status/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await dataSyncQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const state = await job.getState();
    const progress = job.progress();
    
    res.json({
      jobId: jobId,
      status: state,
      progress: progress,
      data: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Get sync history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get completed jobs for this user
    const completed = await dataSyncQueue.getJobs(['completed'], 0, limit);
    const failed = await dataSyncQueue.getJobs(['failed'], 0, limit);
    
    // Filter jobs by user ID
    const userJobs = [...completed, ...failed].filter(job => 
      job.data.userId === req.user._id.toString()
    );
    
    const history = userJobs.map(job => ({
      jobId: job.id,
      status: job.finishedOn ? 'completed' : 'failed',
      platforms: job.data.platforms,
      startedAt: new Date(job.timestamp),
      completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      duration: job.finishedOn ? job.finishedOn - job.timestamp : null,
      error: job.failedReason
    }));
    
    res.json({
      history: history.slice((page - 1) * limit, page * limit),
      total: history.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting sync history:', error);
    res.status(500).json({ error: 'Failed to get sync history' });
  }
});

// Cancel job
router.delete('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await dataSyncQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Verify job belongs to user
    if (job.data.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await job.remove();
    
    res.json({ message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

// Manual trigger for specific platform
router.post('/platform/:platform', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['shopify', 'meta', 'shiprocket'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    const jobId = uuidv4();
    
    const job = await dataSyncQueue.add('syncData', {
      userId: req.user._id,
      platforms: [platform],
      userCredentials: (() => {
        const creds = {};
        if (platform === 'shopify') {
          creds.shopify = {
            storeUrl: req.user.onboarding?.step2?.storeUrl,
            accessToken: req.user.onboarding?.step2?.accessToken,
            isConnected: !!req.user.onboarding?.step2?.accessToken
          };
        } else if (platform === 'meta') {
          creds.meta = {
            accessToken: req.user.onboarding?.step4?.accessToken,
            adAccountId: req.user.onboarding?.step4?.adAccountId,
            isConnected: !!req.user.onboarding?.step4?.accessToken
          };
        } else if (platform === 'shiprocket') {
          creds.shiprocket = {
            email: req.user.onboarding?.step5?.email,
            password: req.user.onboarding?.step5?.password,
            token: req.user.onboarding?.step5?.token,
            isConnected: !!req.user.onboarding?.step5?.token
          };
        }
        return creds;
      })()
    }, {
      jobId: jobId,
      attempts: 3
    });

    res.status(202).json({
      message: `${platform} sync job started`,
      jobId: jobId,
      status: 'queued',
      platform: platform
    });
  } catch (error) {
    console.error(`Error starting ${req.params.platform} sync:`, error);
    res.status(500).json({ error: `Failed to start ${req.params.platform} sync job` });
  }
});

module.exports = router;