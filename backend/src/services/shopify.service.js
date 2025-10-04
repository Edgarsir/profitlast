const axios = require('axios');

class ShopifyService {
  constructor(storeUrl, accessToken) {
    this.storeUrl = storeUrl;
    this.accessToken = accessToken;
    this.baseURL = `https://${storeUrl}/admin/api/2023-10`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  async testConnection() {
    try {
      const response = await this.client.get('/shop.json');
      return { success: true, shop: response.data.shop };
    } catch (error) {
      console.error('Shopify connection test failed:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getProducts(limit = 250, sinceId = null) {
    try {
      const params = { limit };
      if (sinceId) params.since_id = sinceId;
      
      const response = await this.client.get('/products.json', { params });
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllProducts() {
    const allProducts = [];
    let sinceId = null;
    
    try {
      while (true) {
        const products = await this.getProducts(250, sinceId);
        
        if (products.length === 0) break;
        
        allProducts.push(...products);
        sinceId = products[products.length - 1].id;
        
        // Rate limiting - Shopify allows 2 requests per second
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return allProducts;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }

  async getOrders(limit = 250, sinceId = null, status = 'any') {
    try {
      const params = { limit, status };
      if (sinceId) params.since_id = sinceId;
      
      const response = await this.client.get('/orders.json', { params });
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllOrders(status = 'any') {
    const allOrders = [];
    let sinceId = null;
    
    try {
      while (true) {
        const orders = await this.getOrders(250, sinceId, status);
        
        if (orders.length === 0) break;
        
        allOrders.push(...orders);
        sinceId = orders[orders.length - 1].id;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return allOrders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  async getCustomers(limit = 250, sinceId = null) {
    try {
      const params = { limit };
      if (sinceId) params.since_id = sinceId;
      
      const response = await this.client.get('/customers.json', { params });
      return response.data.customers;
    } catch (error) {
      console.error('Error fetching customers:', error.response?.data || error.message);
      throw error;
    }
  }

  async getInventoryLevels() {
    try {
      const response = await this.client.get('/inventory_levels.json');
      return response.data.inventory_levels;
    } catch (error) {
      console.error('Error fetching inventory levels:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAnalytics(startDate, endDate) {
    try {
      // Get orders within date range for analytics
      const params = {
        created_at_min: startDate,
        created_at_max: endDate,
        status: 'any'
      };
      
      const response = await this.client.get('/orders.json', { params });
      const orders = response.data.orders;
      
      // Calculate analytics
      const analytics = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0),
        averageOrderValue: 0,
        topProducts: {},
        customerCount: new Set(orders.map(order => order.customer?.id).filter(Boolean)).size
      };
      
      if (analytics.totalOrders > 0) {
        analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
      }
      
      // Calculate top products
      orders.forEach(order => {
        order.line_items?.forEach(item => {
          const productId = item.product_id;
          if (!analytics.topProducts[productId]) {
            analytics.topProducts[productId] = {
              title: item.title,
              quantity: 0,
              revenue: 0
            };
          }
          analytics.topProducts[productId].quantity += item.quantity;
          analytics.topProducts[productId].revenue += parseFloat(item.price) * item.quantity;
        });
      });
      
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ShopifyService;