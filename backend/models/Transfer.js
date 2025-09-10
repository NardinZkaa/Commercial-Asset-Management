const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema({
  transferId: {
    type: String,
    unique: true,
    required: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  transferType: {
    type: String,
    required: true,
    enum: ['user', 'branch', 'location']
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fromBranch: {
    type: String,
    default: null
  },
  toBranch: {
    type: String,
    default: null
  },
  fromLocation: {
    type: String,
    default: null
  },
  toLocation: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedDate: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'in-transit', 'completed', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  transferCost: {
    type: Number,
    min: 0,
    default: 0
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  timeline: [{
    action: {
      type: String,
      required: true
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for transfer duration
transferRequestSchema.virtual('duration').get(function() {
  if (this.completedDate && this.createdAt) {
    const diffTime = Math.abs(new Date(this.completedDate) - new Date(this.createdAt));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Indexes
transferRequestSchema.index({ asset: 1 });
transferRequestSchema.index({ requestedBy: 1 });
transferRequestSchema.index({ status: 1, priority: 1 });
transferRequestSchema.index({ transferId: 1 });
transferRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to generate transfer ID
transferRequestSchema.pre('save', function(next) {
  if (!this.transferId) {
    const timestamp = Date.now().toString().slice(-6);
    this.transferId = `TRF-${timestamp}`;
  }
  
  // Add timeline entry for status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      description: `Transfer status updated to ${this.status}`,
      performedBy: this.approvedBy || this.requestedBy
    });
  }
  
  next();
});

module.exports = mongoose.model('TransferRequest', transferRequestSchema);