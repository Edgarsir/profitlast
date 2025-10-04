const axios = require('axios');

class ShiprocketService {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.baseURL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
    this.token = null;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async authenticate() {
    try {
      const response = await this.client.post('/auth/login', {
        email: this.email,
        password: this.password
      });
      
      this.token = response.data.token;
      this.client.defaults.headers['Authorization'] = `Bearer ${this.token}`;
      
      return { success: true, token: this.token };
    } catch (error) {
      console.error('Shiprocket authentication failed:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async testConnection() {
    try {
      if (!this.token) {
        const authResult = await this.authenticate();
        if (!authResult.success) {
          return authResult;
        }
      }
      
      const response = await this.client.get('/settings/company/pickup');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Shiprocket connection test failed:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getOrders(page = 1, perPage = 50) {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await this.client.get('/orders', {
        params: {
          page: page,
          per_page: perPage
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllOrders() {
    const allOrders = [];
    let page = 1;
    let hasMore = true;
    
    try {
      while (hasMore) {
        const response = await this.getOrders(page, 50);
        
        if (response.data && response.data.length > 0) {
          allOrders.push(...response.data);
          page++;
          
          // Check if we've reached the last page
          if (response.data.length < 50) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      return allOrders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  async getShipments(page = 1, perPage = 50) {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await this.client.get('/shipments', {
        params: {
          page: page,
          per_page: perPage
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching shipments:', error.response?.data || error.message);
      throw error;
    }
  }

  async trackShipment(awbCode) {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await this.client.get(`/courier/track/awb/${awbCode}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking shipment:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCourierPartners() {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await this.client.get('/courier/serviceability');
      return response.data;
    } catch (error) {
      console.error('Error fetching courier partners:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPickupLocations() {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await this.client.get('/settings/company/pickup');
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup locations:', error.response?.data || error.message);
      throw error;
    }
  }

  async getShippingAnalytics(startDate, endDate) {
    try {
      if (!this.token) await this.authenticate();
      
      // Get all shipments within date range
      const allShipments = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await this.getShipments(page, 50);
        
        if (response.data && response.data.length > 0) {
          // Filter by date range
          const filteredShipments = response.data.filter(shipment => {
            const shipmentDate = new Date(shipment.created_at);
            return shipmentDate >= new Date(startDate) && shipmentDate <= new Date(endDate);
          });
          
          allShipments.push(...filteredShipments);
          
          if (response.data.length < 50) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Calculate analytics
      const analytics = {
        totalShipments: allShipments.length,
        deliveredShipments: allShipments.filter(s => s.status === 'DELIVERED').length,
        inTransitShipments: allShipments.filter(s => s.status === 'IN_TRANSIT').length,
        returnedShipments: allShipments.filter(s => s.status === 'RETURNED').length,
        averageDeliveryTime: 0,
        totalShippingCost: allShipments.reduce((sum, s) => sum + parseFloat(s.shipping_charges || 0), 0),
        courierPartnerBreakdown: {},
        deliveryPerformance: {}
      };
      
      // Calculate delivery performance by courier
      allShipments.forEach(shipment => {
        const courier = shipment.courier_name || 'Unknown';
        if (!analytics.courierPartnerBreakdown[courier]) {
          analytics.courierPartnerBreakdown[courier] = {
            total: 0,
            delivered: 0,
            returned: 0,
            cost: 0
          };
        }
        
        analytics.courierPartnerBreakdown[courier].total++;
        analytics.courierPartnerBreakdown[courier].cost += parseFloat(shipment.shipping_charges || 0);
        
        if (shipment.status === 'DELIVERED') {
          analytics.courierPartnerBreakdown[courier].delivered++;
        } else if (shipment.status === 'RETURNED') {
          analytics.courierPartnerBreakdown[courier].returned++;
        }
      });
      
      // Calculate delivery rates
      Object.keys(analytics.courierPartnerBreakdown).forEach(courier => {
        const data = analytics.courierPartnerBreakdown[courier];
        analytics.deliveryPerformance[courier] = {
          deliveryRate: data.total > 0 ? (data.delivered / data.total * 100).toFixed(2) : 0,
          returnRate: data.total > 0 ? (data.returned / data.total * 100).toFixed(2) : 0,
          averageCost: data.total > 0 ? (data.cost / data.total).toFixed(2) : 0
        };
      });
      
      return analytics;
    } catch (error) {
      console.error('Error fetching shipping analytics:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId) {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await this.client.get(`/orders/show/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order status:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ShiprocketService;