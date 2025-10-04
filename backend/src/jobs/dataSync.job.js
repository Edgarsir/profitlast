const Bull = require('bull');
const ShopifyService = require('../services/shopify.service');
const MetaService = require('../services/meta.service');
const ShiprocketService = require('../services/shiprocket.service');

const jsonStorage = require('../utils/jsonStorage');

// Create job queue
const dataSyncQueue = new Bull('data sync', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD
  }
});



// Job processor
dataSyncQueue.process('syncData', async (job) => {
  const { userId, platforms, userCredentials } = job.data;
  const io = require('../app').io;
  
  try {
    
    job.progress(0);
    io.to(`job-${job.id}`).emit('progress', { jobId: job.id, progress: 0, message: 'Starting data sync...' });
    
    const results = {
      shopify: null,
      meta: null,
      shiprocket: null,
      summary: {
        totalRecords: 0,
        errors: [],
        startTime: new Date(),
        endTime: null
      }
    };
    
    const totalPlatforms = platforms.length;
    let completedPlatforms = 0;
    
    // Sync Shopify data
    if (platforms.includes('shopify') && userCredentials.shopify?.isConnected) {
      try {
        io.to(`job-${job.id}`).emit('progress', { 
          jobId: job.id, 
          progress: Math.round((completedPlatforms / totalPlatforms) * 100), 
          message: 'Syncing Shopify data...' 
        });
        
        const shopifyService = new ShopifyService(
          userCredentials.shopify.storeUrl,
          userCredentials.shopify.accessToken
        );
        
        // Test connection
        const connectionTest = await shopifyService.testConnection();
        if (!connectionTest.success) {
          throw new Error(`Shopify connection failed: ${connectionTest.error}`);
        }
        
        // Fetch products
        const products = await shopifyService.getAllProducts();
        
        // Save products to JSON storage
        for (const product of products) {
          const productData = {
            userId: userId,
            shopifyId: product.id,
            title: product.title,
            description: product.body_html,
            vendor: product.vendor,
            productType: product.product_type,
            handle: product.handle,
            status: product.status,
            tags: product.tags ? product.tags.split(',').map(tag => tag.trim()) : [],
            variants: product.variants?.map(variant => ({
              variantId: variant.id,
              title: variant.title,
              price: parseFloat(variant.price),
              compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
              sku: variant.sku,
              inventoryQuantity: variant.inventory_quantity,
              weight: variant.weight,
              weightUnit: variant.weight_unit
            })) || [],
            images: product.images?.map(image => ({
              id: image.id,
              src: image.src,
              alt: image.alt
            })) || [],
            lastSyncedAt: new Date().toISOString()
          };
          
          await jsonStorage.findOneAndUpdate(
            'products',
            { userId: userId, shopifyId: product.id },
            productData,
            { upsert: true }
          );
        }
        
        // Fetch orders for analytics
        const orders = await shopifyService.getAllOrders();
        
        // Store orders data could be added here if needed
        // For now, we're just counting them for the summary
        
        results.shopify = {
          products: products.length,
          orders: orders.length,
          status: 'success'
        };
        
        results.summary.totalRecords += products.length + orders.length;
        
      } catch (error) {
        console.error('Shopify sync error:', error);
        results.shopify = { status: 'error', error: error.message };
        results.summary.errors.push(`Shopify: ${error.message}`);
      }
      
      completedPlatforms++;
    }
    
    // Sync Meta data
    if (platforms.includes('meta') && userCredentials.meta?.isConnected) {
      try {
        io.to(`job-${job.id}`).emit('progress', { 
          jobId: job.id, 
          progress: Math.round((completedPlatforms / totalPlatforms) * 100), 
          message: 'Syncing Meta data...' 
        });
        
        const metaService = new MetaService(
          userCredentials.meta.accessToken,
          userCredentials.meta.adAccountId
        );
        
        // Test connection
        const connectionTest = await metaService.testConnection();
        if (!connectionTest.success) {
          throw new Error(`Meta connection failed: ${connectionTest.error}`);
        }
        
        // Get comprehensive analytics
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // For now, get basic ad insights using the ad account ID
        const adInsights = await metaService.getAdInsights(
          userCredentials.meta.adAccountId,
          ['campaign_name', 'impressions', 'reach', 'clicks', 'spend', 'cpm', 'cpc', 'ctr'],
          { since: startDate, until: endDate }
        );
        
        // Process analytics data for storage
        const metaDataCount = adInsights.length;
        
        results.meta = {
          adInsights: adInsights.length,
          status: 'success'
        };
        
        results.summary.totalRecords += metaDataCount;
        
      } catch (error) {
        console.error('Meta sync error:', error);
        results.meta = { status: 'error', error: error.message };
        results.summary.errors.push(`Meta: ${error.message}`);
      }
      
      completedPlatforms++;
    }
    
    // Sync Shiprocket data
    if (platforms.includes('shiprocket') && userCredentials.shiprocket?.isConnected) {
      try {
        io.to(`job-${job.id}`).emit('progress', { 
          jobId: job.id, 
          progress: Math.round((completedPlatforms / totalPlatforms) * 100), 
          message: 'Syncing Shiprocket data...' 
        });
        
        const shiprocketService = new ShiprocketService(
          userCredentials.shiprocket.email,
          process.env.SHIPROCKET_PASSWORD // This should be stored securely
        );
        
        // Test connection
        const connectionTest = await shiprocketService.testConnection();
        if (!connectionTest.success) {
          throw new Error(`Shiprocket connection failed: ${connectionTest.error}`);
        }
        
        // Get orders and shipments
        const orders = await shiprocketService.getAllOrders();
        const shipments = await shiprocketService.getShipments();
        
        // Get analytics
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const analytics = await shiprocketService.getShippingAnalytics(startDate, endDate);
        
        // Process shipping data for storage
        const shippingDataCount = orders.length + 1; // orders + analytics summary
        
        results.shiprocket = {
          orders: orders.length,
          shipments: shipments.data?.length || 0,
          analytics: analytics,
          status: 'success'
        };
        
        results.summary.totalRecords += shippingDataCount;
        
      } catch (error) {
        console.error('Shiprocket sync error:', error);
        results.shiprocket = { status: 'error', error: error.message };
        results.summary.errors.push(`Shiprocket: ${error.message}`);
      }
      
      completedPlatforms++;
    }
    
    // Update user's last sync time
    await jsonStorage.updateOne('users', { _id: userId }, { lastDataSync: new Date().toISOString() });
    
    results.summary.endTime = new Date();
    results.summary.duration = results.summary.endTime - results.summary.startTime;
    
    job.progress(100);
    io.to(`job-${job.id}`).emit('progress', { 
      jobId: job.id, 
      progress: 100, 
      message: 'Data sync completed!',
      results: results.summary
    });
    
    return results;
    
  } catch (error) {
    console.error('Data sync job error:', error);
    io.to(`job-${job.id}`).emit('error', { 
      jobId: job.id, 
      error: error.message 
    });
    throw error;
  }
});

// Job event handlers
dataSyncQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
});

dataSyncQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

dataSyncQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

module.exports = dataSyncQueue;