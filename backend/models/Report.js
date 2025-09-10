const mongoose = require('mongoose');

const reportConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['asset-inventory', 'maintenance-summary', 'depreciation-analysis', 'audit-compliance', 'cost-analysis', 'transfer-summary', 'acquisition-summary']
  },
  format: {
    type: String,
    required: true,
    enum: ['pdf', 'csv', 'excel'],
    default: 'pdf'
  },
  dateRange: {
    type: String,
    required: true,
    enum: ['last-month', 'last-quarter', 'last-year', 'custom'],
    default: 'last-month'
  },
  customStartDate: {
    type: Date
  },
  customEndDate: {
    type: Date
  },
  filters: {
    branch: String,
    category: String,
    status: String,
    department: String,
    assignedTo: String
  },
  includeCharts: {
    type: Boolean,
    default: true
  },
  includeDetails: {
    type: Boolean,
    default: true
  }
});

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  config: reportConfigSchema,
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    nextRun: Date,
    lastRun: Date,
    recipients: [String] // Email addresses
  },
  metadata: {
    recordCount: Number,
    totalValue: Number,
    dateGenerated: {
      type: Date,
      default: Date.now
    },
    processingTime: Number // milliseconds
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file size in MB
reportSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Indexes
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ 'config.type': 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reportId: 1 });

// Pre-save middleware to generate report ID
reportSchema.pre('save', function(next) {
  if (!this.reportId) {
    const timestamp = Date.now().toString().slice(-6);
    this.reportId = `RPT-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);