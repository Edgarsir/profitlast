const { createClient } = require('@supabase/supabase-js');

class SupabaseClient {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    // Try service key first, fallback to anon key
    this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('⚠️  Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY)');
      this.client = null;
      return;
    }
    
    this.client = createClient(this.supabaseUrl, this.supabaseKey);
    
    if (process.env.SUPABASE_SERVICE_KEY) {
      console.log('✅ Supabase client initialized with service key');
    } else {
      console.log('✅ Supabase client initialized with anon key');
      console.warn('⚠️  Using anon key - some admin operations may be limited');
    }
  }

  // Users table operations
  async findUser(query) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    let queryBuilder = this.client.from('users').select('*');
    
    Object.keys(query).forEach(key => {
      queryBuilder = queryBuilder.eq(key, query[key]);
    });
    
    const { data, error } = await queryBuilder.single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return data;
  }

  async findUserById(id) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async createUser(userData) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUser(id, updates) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Products table operations
  async findProducts(query = {}) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    let queryBuilder = this.client.from('products').select('*');
    
    Object.keys(query).forEach(key => {
      queryBuilder = queryBuilder.eq(key, query[key]);
    });
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return data || [];
  }

  async upsertProduct(productData) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('products')
      .upsert(productData, { 
        onConflict: 'user_id,shopify_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Chat history operations
  async findChatSession(userId, sessionId) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async createChatSession(sessionData) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('chat_history')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateChatSession(id, updates) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('chat_history')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getChatHistory(userId, limit = 10, offset = 0) {
    if (!this.client) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.client
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  }

  // Test connection
  async testConnection() {
    if (!this.client) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      const { data, error } = await this.client
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      return { success: true, message: 'Supabase connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SupabaseClient();