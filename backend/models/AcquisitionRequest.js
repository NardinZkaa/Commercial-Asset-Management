const mongoose = require('mongoose');

const acquisitionItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Laptop', 'Monitor', 'Mobile', 'Tablet', 'Desktop', 'Software', 'Furniture', 'Equipment', 'Other']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  specifications: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['immediate', 'within-month', 'within-quarter', 'flexible'],
    default: 'flexible'
  },
  vendor: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  warranty: {
    type: String,
    trim: true
  }
});

const vendorQuoteSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  vendorEmail: {
    type: String,
    required: true,
    trim: true
  },
  quotedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryTime: {
    type: String,
    required: true,
    trim: true
  },
  warranty: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  quoteDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  quoteDocument: {
    type: String, // File path
    default: null
  }
});

const acquisitionRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'Marketing', 'Design', 'HR', 'Finance', 'Operations', 'IT']
  },
  branch: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'ordered', 'delivered', 'completed'],
    default: 'draft'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  justification: {
    type: String,
    required: true,
    trim: true
  },
  businessCase: {
    type: String,
    required: true,
    trim: true
  },
  items: [acquisitionItemSchema],
  totalCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  budgetCode: {
    type: String,
    trim: true
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
  rejectionReason: {
    type: String,
    trim: true
  },
  vendorQuotes: [vendorQuoteSchema],
  selectedVendor: {
    type: String,
    trim: true
  },
  poNumber: {
    type: String,
    trim: true
  },
  expectedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  notes: {
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

// Virtual for request age
acquisitionRequestSchema.virtual('age').get(function() {
  const diffTime = Math.abs(new Date() - new Date(this.createdAt));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for selected quote
acquisitionRequestSchema.virtual('selectedQuote').get(function() {
  return this.vendorQuotes.find(quote => quote.selected);
});

// Indexes
acquisitionRequestSchema.index({ requestedBy: 1 });
acquisitionRequestSchema.index({ department: 1 });
acquisitionRequestSchema.index({ status: 1, priority: 1 });
acquisitionRequestSchema.index({ requestId: 1 });
acquisitionRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to generate request ID and calculate total cost
acquisitionRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString().slice(-6);
    this.requestId = `ACQ-${timestamp}`;
  }
  
  // Calculate total cost from items
  this.totalCost = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Add timeline entry for status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      description: `Request status updated to ${this.status}`,
      performedBy: this.approvedBy || this.requestedBy
    });
  }
  
  next();
});

// Static method to get acquisition statistics
acquisitionRequestSchema.statics.getStatistics = async function(department = null) {
  const filter = {};
  if (department) filter.department = department;
  
  const stats = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalCost' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('AcquisitionRequest', acquisitionRequestSchema);