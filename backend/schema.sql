-- Database Schema for E-commerce Analytics Backend

-- Enable UUID extension (for PostgreSQL/Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  step INTEGER DEFAULT 1,
  onboarding JSON DEFAULT '{}',
  last_data_sync TIMESTAMP,
  preferences JSON DEFAULT '{
    "notifications": true,
    "autoSync": false,
    "syncInterval": "daily"
  }',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  shopify_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  vendor VARCHAR(255),
  product_type VARCHAR(255),
  handle VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  tags JSON DEFAULT '[]',
  variants JSON DEFAULT '[]',
  images JSON DEFAULT '[]',
  seo JSON DEFAULT '{}',
  analytics JSON DEFAULT '{
    "totalSales": 0,
    "totalRevenue": 0,
    "averageOrderValue": 0,
    "conversionRate": 0
  }',
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, shopify_id)
);

-- Chat history table
CREATE TABLE chat_history (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  messages JSON DEFAULT '[]',
  summary TEXT,
  tags JSON DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table (for storing Shopify orders)
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  shopify_id VARCHAR(255) NOT NULL,
  order_number VARCHAR(255),
  total_price DECIMAL(10,2),
  financial_status VARCHAR(50),
  fulfillment_status VARCHAR(50),
  line_items JSON DEFAULT '[]',
  customer JSON DEFAULT '{}',
  shipping_address JSON DEFAULT '{}',
  billing_address JSON DEFAULT '{}',
  order_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, shopify_id)
);

-- Meta analytics table
CREATE TABLE meta_analytics (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  ad_account_id VARCHAR(255),
  campaign_data JSON DEFAULT '{}',
  insights_data JSON DEFAULT '{}',
  date_range JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shiprocket data table
CREATE TABLE shiprocket_data (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(255),
  shipment_id VARCHAR(255),
  tracking_data JSON DEFAULT '{}',
  status VARCHAR(100),
  courier_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_shopify_id ON products(shopify_id);
CREATE INDEX idx_chat_history_user_session ON chat_history(user_id, session_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_shopify_id ON orders(shopify_id);

-- Sample data (with placeholder values - replace with your actual data)
INSERT INTO users (
  id,
  first_name,
  last_name,
  email,
  password,
  is_verified,
  is_admin,
  step,
  onboarding
) VALUES (
  '68e0f220-a16e-0760-0cb8-22dd00000000',
  'Demo',
  'User',
  'demo@example.com',
  '$2b$10$hashedPasswordHere',
  true,
  false,
  6,
  '{
    "step1": {
      "fullName": "Demo User",
      "email": "demo@example.com",
      "phone": "1234567890",
      "industry": "E-commerce",
      "referral": "Other"
    },
    "step2": {
      "storeUrl": "your-store.myshopify.com",
      "platform": "Shopify",
      "accessToken": "your_shopify_access_token_here"
    },
    "step4": {
      "adAccountId": "your_ad_account_id",
      "accessToken": "your_meta_access_token_here"
    },
    "step5": {
      "platform": "Shiprocket",
      "email": "your_shiprocket_email",
      "token": "your_shiprocket_token_here"
    }
  }'
);