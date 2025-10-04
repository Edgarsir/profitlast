const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await supabase.findUser({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isVerified: user.is_verified,
        step: user.step,
        platforms: {
          shopify: {
            connected: !!user.onboarding?.step2?.accessToken,
            storeUrl: user.onboarding?.step2?.storeUrl
          },
          meta: {
            connected: !!user.onboarding?.step4?.accessToken,
            adAccountId: user.onboarding?.step4?.adAccountId
          },
          shiprocket: {
            connected: !!user.onboarding?.step5?.token,
            email: user.onboarding?.step5?.email
          }
        },
        lastDataSync: user.last_data_sync
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await supabase.findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isVerified: user.is_verified,
        step: user.step,
        platforms: {
          shopify: {
            connected: !!user.onboarding?.step2?.accessToken,
            storeUrl: user.onboarding?.step2?.storeUrl,
            accessToken: user.onboarding?.step2?.accessToken
          },
          meta: {
            connected: !!user.onboarding?.step4?.accessToken,
            adAccountId: user.onboarding?.step4?.adAccountId,
            accessToken: user.onboarding?.step4?.accessToken
          },
          shiprocket: {
            connected: !!user.onboarding?.step5?.token,
            email: user.onboarding?.step5?.email,
            token: user.onboarding?.step5?.token,
            password: user.onboarding?.step5?.password
          }
        },
        lastDataSync: user.last_data_sync,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update platform credentials
router.put('/platforms/:platform', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.params;
    const updates = req.body;
    
    const user = await supabase.findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const onboarding = user.onboarding || {};
    
    switch (platform) {
      case 'shopify':
        if (!onboarding.step2) onboarding.step2 = {};
        Object.assign(onboarding.step2, updates);
        break;
        
      case 'meta':
        if (!onboarding.step4) onboarding.step4 = {};
        Object.assign(onboarding.step4, updates);
        break;
        
      case 'shiprocket':
        if (!onboarding.step5) onboarding.step5 = {};
        Object.assign(onboarding.step5, updates);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid platform' });
    }
    
    await supabase.updateUser(user.id, { onboarding });
    
    res.json({ message: `${platform} credentials updated successfully` });
  } catch (error) {
    console.error('Update platform error:', error);
    res.status(500).json({ error: 'Failed to update platform credentials' });
  }
});

// Test platform connections
router.get('/platforms/test', authMiddleware, async (req, res) => {
  try {
    const user = await supabase.findUserById(req.user.userId);
    const results = {};
    
    // Test Shopify connection
    if (user.onboarding?.step2?.accessToken) {
      const ShopifyService = require('../services/shopify.service');
      const shopifyService = new ShopifyService(
        user.onboarding.step2.storeUrl,
        user.onboarding.step2.accessToken
      );
      results.shopify = await shopifyService.testConnection();
    } else {
      results.shopify = { success: false, error: 'No credentials found' };
    }
    
    // Test Meta connection
    if (user.onboarding?.step4?.accessToken) {
      const MetaService = require('../services/meta.service');
      const metaService = new MetaService(user.onboarding.step4.accessToken);
      results.meta = await metaService.testConnection();
    } else {
      results.meta = { success: false, error: 'No credentials found' };
    }
    
    // Test Shiprocket connection
    if (user.onboarding?.step5?.email && user.onboarding?.step5?.password) {
      const ShiprocketService = require('../services/shiprocket.service');
      const shiprocketService = new ShiprocketService(
        user.onboarding.step5.email,
        user.onboarding.step5.password
      );
      results.shiprocket = await shiprocketService.testConnection();
    } else {
      results.shiprocket = { success: false, error: 'No credentials found' };
    }
    
    res.json(results);
  } catch (error) {
    console.error('Test connections error:', error);
    res.status(500).json({ error: 'Failed to test connections' });
  }
});

module.exports = router;