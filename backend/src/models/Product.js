const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopifyId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  vendor: String,
  productType: String,
  handle: String,
  status: {
    type: String,
    enum: ['active', 'archived', 'draft'],
    default: 'active'
  },
  tags: [String],
  variants: [{
    variantId: String,
    title: String,
    price: Number,
    compareAtPrice: Number,
    sku: String,
    inventoryQuantity: Number,
    weight: Number,
    weightUnit: String
  }],
  images: [{
    id: String,
    src: String,
    alt: String
  }],
  seo: {
    title: String,
    description: String
  },
  analytics: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
productSchema.index({ userId: 1, shopifyId: 1 }, { unique: true });
productSchema.index({ userId: 1, status: 1 });
productSchema.index({ userId: 1, 'analytics.totalSales': -1 });

module.exports = mongoose.model('Product', productSchema);