const axios = require('axios');

class MetaService {
  constructor(accessToken, pageId = null) {
    this.accessToken = accessToken;
    this.pageId = pageId;
    this.baseURL = 'https://graph.facebook.com/v18.0';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        access_token: this.accessToken
      }
    });
  }

  async testConnection() {
    try {
      const response = await this.client.get('/me');
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Meta connection test failed:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async getPages() {
    try {
      const response = await this.client.get('/me/accounts', {
        params: {
          fields: 'id,name,access_token,category,tasks'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pages:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPageInsights(pageId, metrics, period = 'day', since = null, until = null) {
    try {
      const params = {
        metric: metrics.join(','),
        period: period
      };
      
      if (since) params.since = since;
      if (until) params.until = until;
      
      const response = await this.client.get(`/${pageId}/insights`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching page insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdAccounts() {
    try {
      const response = await this.client.get('/me/adaccounts', {
        params: {
          fields: 'id,name,account_status,currency,timezone_name'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ad accounts:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdInsights(adAccountId, fields, timeRange = null) {
    try {
      const params = {
        fields: fields.join(','),
        level: 'campaign'
      };
      
      if (timeRange) {
        params.time_range = JSON.stringify(timeRange);
      }
      
      const response = await this.client.get(`/${adAccountId}/insights`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ad insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCampaigns(adAccountId) {
    try {
      const response = await this.client.get(`/${adAccountId}/campaigns`, {
        params: {
          fields: 'id,name,status,objective,created_time,updated_time'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdSets(campaignId) {
    try {
      const response = await this.client.get(`/${campaignId}/adsets`, {
        params: {
          fields: 'id,name,status,targeting,bid_amount,daily_budget,lifetime_budget'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ad sets:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAds(adSetId) {
    try {
      const response = await this.client.get(`/${adSetId}/ads`, {
        params: {
          fields: 'id,name,status,creative,tracking_specs'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ads:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPagePosts(pageId, limit = 100) {
    try {
      const response = await this.client.get(`/${pageId}/posts`, {
        params: {
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit: limit
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching page posts:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPostComments(postId) {
    try {
      const response = await this.client.get(`/${postId}/comments`, {
        params: {
          fields: 'id,message,created_time,from,like_count,comment_count'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching post comments:', error.response?.data || error.message);
      throw error;
    }
  }

  async getComprehensiveAnalytics(pageId, adAccountId, startDate, endDate) {
    try {
      const timeRange = {
        since: startDate,
        until: endDate
      };

      // Get page insights
      const pageMetrics = [
        'page_impressions',
        'page_reach',
        'page_engaged_users',
        'page_fans',
        'page_post_engagements'
      ];
      
      const pageInsights = await this.getPageInsights(pageId, pageMetrics, 'day', startDate, endDate);

      // Get ad insights
      const adFields = [
        'campaign_name',
        'impressions',
        'reach',
        'clicks',
        'spend',
        'cpm',
        'cpc',
        'ctr',
        'frequency'
      ];
      
      const adInsights = await this.getAdInsights(adAccountId, adFields, timeRange);

      // Get recent posts
      const posts = await this.getPagePosts(pageId, 50);

      return {
        pageInsights,
        adInsights,
        posts,
        summary: {
          totalSpend: adInsights.reduce((sum, ad) => sum + parseFloat(ad.spend || 0), 0),
          totalImpressions: adInsights.reduce((sum, ad) => sum + parseInt(ad.impressions || 0), 0),
          totalClicks: adInsights.reduce((sum, ad) => sum + parseInt(ad.clicks || 0), 0),
          averageCTR: adInsights.length > 0 ? 
            adInsights.reduce((sum, ad) => sum + parseFloat(ad.ctr || 0), 0) / adInsights.length : 0
        }
      };
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      throw error;
    }
  }
}

module.exports = MetaService;