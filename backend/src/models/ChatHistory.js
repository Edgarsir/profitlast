const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      queryType: String, // 'analytics', 'product_info', 'order_status', etc.
      dataSourcesUsed: [String], // ['shopify', 'meta', 'shiprocket']
      processingTime: Number, // milliseconds
      tokensUsed: Number
    }
  }],
  summary: String, // AI-generated summary of the conversation
  tags: [String], // For categorizing conversations
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatHistorySchema.index({ userId: 1, sessionId: 1 });
chatHistorySchema.index({ userId: 1, createdAt: -1 });
chatHistorySchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);