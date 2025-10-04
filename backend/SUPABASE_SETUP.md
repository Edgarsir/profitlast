# Supabase Setup Guide

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose organization and enter:
   - **Name**: `ecommerce-analytics`
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to you
5. Click "Create new project"

### 2. Get Your Credentials
After project creation, go to **Settings > API**:

- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (public key)
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (secret key)

### 3. Update Your .env File
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### 4. Create Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the entire content from `supabase-schema.sql`
3. Click "Run" to execute the SQL

This will create:
- ✅ All required tables (users, products, chat_history, orders, etc.)
- ✅ Proper indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Your existing user data

### 5. Verify Setup
Run your backend:
```bash
npm install
npm run dev
```

You should see:
```
✅ Supabase connected successfully
✅ Redis connected successfully
🚀 Server running on port 3001
```

### 6. Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taneshpurohit09@gmail.com","password":"your_password"}'
```

## 🎯 What You Get with Supabase

### **Advantages:**
- ✅ **PostgreSQL Database** - Powerful, reliable, SQL-based
- ✅ **Real-time Subscriptions** - Live data updates
- ✅ **Built-in Authentication** - Can replace JWT if needed
- ✅ **Row Level Security** - Automatic data isolation
- ✅ **Auto-generated APIs** - REST and GraphQL
- ✅ **Dashboard** - Visual database management
- ✅ **Free Tier** - 500MB database, 2GB bandwidth
- ✅ **Backup & Recovery** - Automatic backups
- ✅ **Edge Functions** - Serverless functions if needed

### **Your Data Structure:**
```sql
users (id, first_name, last_name, email, onboarding, ...)
├── products (shopify data)
├── orders (shopify orders)
├── chat_history (AI conversations)
├── meta_analytics (facebook/instagram data)
└── shiprocket_data (shipping data)
```

### **Security Features:**
- 🔒 Row Level Security ensures users only see their own data
- 🔒 Service key for backend operations
- 🔒 Anon key for frontend (when needed)
- 🔒 JWT token validation

## 🔧 Development Tips

### View Your Data
- Go to **Table Editor** in Supabase dashboard
- Browse/edit data visually
- Run SQL queries in **SQL Editor**

### Monitor Performance
- **Logs** tab shows all database queries
- **API** tab shows usage statistics
- **Reports** tab shows performance metrics

### Backup Strategy
- Supabase automatically backs up your data
- You can also export data manually from dashboard
- Consider setting up additional backups for production

## 🚨 Important Notes

1. **Keep Service Key Secret** - Never expose in frontend code
2. **Use Anon Key for Frontend** - Safe for client-side use
3. **RLS Policies** - Ensure proper data access control
4. **Connection Limits** - Free tier has connection limits
5. **Upgrade Path** - Easy to upgrade when you need more resources

Your backend is now powered by a production-ready PostgreSQL database! 🎉