const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['hardware', 'software', 'network', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  estimatedCost: {
    type: Number,
    min: 0,
    default: 0
  },
  actualCost: {
    type: Number,
    min: 0,
    default: 0
  },
  laborCost: {
    type: Number,
    min: 0,
    default: 0
  },
  partsCost: {
    type: Number,
    min: 0,
    default: 0
  },
  timeSpent: {
    type: Number, // in hours
    min: 0,
    default: 0
  },
  estimatedCompletion: {
    type: Date
  },
  actualCompletion: {
    type: Date
  },
  warrantyEligible: {
    type: Boolean,
    default: false
  },
  warrantyUsed: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  resolution: {
    type: String,
    trim: true
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  workLog: [{
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
    },
    timeSpent: Number // in hours
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total cost
maintenanceRequestSchema.virtual('totalCost').get(function() {
  return (this.laborCost || 0) + (this.partsCost || 0);
});

// Virtual for duration
maintenanceRequestSchema.virtual('duration').get(function() {
  if (this.actualCompletion && this.createdAt) {
    const diffTime = Math.abs(new Date(this.actualCompletion) - new Date(this.createdAt));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Virtual for overdue status
maintenanceRequestSchema.virtual('isOverdue').get(function() {
  if (this.estimatedCompletion && this.status !== 'completed' && this.status !== 'cancelled') {
    return new Date() > new Date(this.estimatedCompletion);
  }
  return false;
});

// Indexes
maintenanceRequestSchema.index({ asset: 1 });
maintenanceRequestSchema.index({ requestedBy: 1 });
maintenanceRequestSchema.index({ assignedTo: 1 });
maintenanceRequestSchema.index({ status: 1, priority: 1 });
maintenanceRequestSchema.index({ createdAt: -1 });
maintenanceRequestSchema.index({ estimatedCompletion: 1 });

// Pre-save middleware to update work log
maintenanceRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.workLog.push({
      action: `Status changed to ${this.status}`,
      description: `Request status updated to ${this.status}`,
      performedBy: this.assignedTo || this.requestedBy,
      timestamp: new Date()
    });
  }
  next();
});

// Static method to get maintenance statistics
maintenanceRequestSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCost: { $avg: '$actualCost' },
        totalCost: { $sum: '$actualCost' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get cost analytics
maintenanceRequestSchema.statics.getCostAnalytics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalCost: { $sum: '$actualCost' },
        avgCost: { $avg: '$actualCost' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);