const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  step: {
    type: Number,
    default: 1
  },
  onboarding: {
    step1: {
      fullName: String,
      email: String,
      phone: String,
      whatsapp: String,
      industry: String,
      referral: String
    },
    step2: {
      storeUrl: String,
      apiKey: String,
      apiSecret: String,
      accessToken: String,
      platform: String
    },
    step4: {
      adAccountId: String,
      accessToken: String,
      createAt: Date
    },
    step5: {
      platform: String,
      email: String,
      password: String,
      token: String
    }
  },
  // Computed fields for easy access
  shopifyStore: {
    storeName: { type: String, get: function() { return this.onboarding?.step2?.storeUrl; } },
    accessToken: { type: String, get: function() { return this.onboarding?.step2?.accessToken; } },
    isConnected: { type: Boolean, get: function() { return !!this.onboarding?.step2?.accessToken; } }
  },
  metaAccount: {
    accessToken: { type: String, get: function() { return this.onboarding?.step4?.accessToken; } },
    adAccountId: { type: String, get: function() { return this.onboarding?.step4?.adAccountId; } },
    isConnected: { type: Boolean, get: function() { return !!this.onboarding?.step4?.accessToken; } }
  },
  shiprocketAccount: {
    email: { type: String, get: function() { return this.onboarding?.step5?.email; } },
    token: { type: String, get: function() { return this.onboarding?.step5?.token; } },
    password: { type: String, get: function() { return this.onboarding?.step5?.password; } },
    isConnected: { type: Boolean, get: function() { return !!this.onboarding?.step5?.token; } }
  },
  lastDataSync: {
    type: Date,
    default: null
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    autoSync: { type: Boolean, default: false },
    syncInterval: { type: String, default: 'daily' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);