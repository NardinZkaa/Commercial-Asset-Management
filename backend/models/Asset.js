const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Furniture', 'Vehicles', 'Equipment', 'Laptop', 'Monitor', 'Mobile', 'Tablet', 'Desktop']
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'Under Maintenance', 'Retired'],
    default: 'Active'
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  branch: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  warranty: {
    type: String,
    trim: true
  },
  warrantyExpiry: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String, // Base64 encoded QR code image
    default: null
  },
  qrCodeIdentifier: {
    type: String,
    unique: true
  },
  photo: {
    type: String, // File path or URL
    default: null
  },
  lastAuditDate: {
    type: Date
  },
  nextAuditDate: {
    type: Date
  },
  maintenanceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for depreciation calculation
assetSchema.virtual('depreciation').get(function() {
  if (this.purchasePrice && this.currentValue) {
    return ((this.purchasePrice - this.currentValue) / this.purchasePrice * 100).toFixed(2);
  }
  return 0;
});

// Virtual for age calculation
assetSchema.virtual('age').get(function() {
  if (this.purchaseDate) {
    const now = new Date();
    const purchase = new Date(this.purchaseDate);
    const diffTime = Math.abs(now - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 365);
  }
  return 0;
});

// Indexes for better query performance
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ branch: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ nextAuditDate: 1 });

// Pre-save middleware to generate QR code identifier
assetSchema.pre('save', function(next) {
  if (!this.qrCodeIdentifier) {
    this.qrCodeIdentifier = `ASSET-${this.serialNumber}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);