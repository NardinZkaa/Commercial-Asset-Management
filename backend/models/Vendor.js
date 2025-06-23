const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  specialization: [{
    type: String,
    enum: ['Hardware', 'Software', 'Network', 'Mobile', 'Security', 'Apple Products', 'Laptop Repair', 'Infrastructure', 'System Integration']
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  responseTime: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  contractDetails: {
    contractNumber: String,
    startDate: Date,
    endDate: Date,
    terms: String
  },
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }],
  serviceAreas: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['24/7', 'Business Hours', 'On-Call', 'Scheduled'],
    default: 'Business Hours'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  performanceMetrics: {
    totalTicketsCompleted: {
      type: Number,
      default: 0
    },
    avgResolutionTime: {
      type: Number,
      default: 0
    },
    customerSatisfactionScore: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
vendorSchema.index({ email: 1 });
vendorSchema.index({ specialization: 1 });
vendorSchema.index({ rating: -1 });
vendorSchema.index({ isActive: 1 });

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Method to check if vendor is available for a specific specialization
vendorSchema.methods.hasSpecialization = function(specialization) {
  return this.specialization.includes(specialization);
};

// Static method to find available vendors by specialization
vendorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({
    specialization: specialization,
    isActive: true
  }).sort({ rating: -1, hourlyRate: 1 });
};

module.exports = mongoose.model('Vendor', vendorSchema);