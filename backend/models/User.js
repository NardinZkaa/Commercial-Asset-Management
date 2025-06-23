const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Manager', 'Employee', 'Auditor'],
    default: 'Employee'
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
  avatar: {
    type: String, // File path or URL
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  assignedAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  permissions: [{
    type: String,
    enum: [
      'view_assets',
      'create_assets',
      'edit_assets',
      'delete_assets',
      'assign_assets',
      'view_maintenance',
      'create_maintenance',
      'approve_maintenance',
      'view_analytics',
      'manage_users',
      'system_settings'
    ]
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      maintenance: { type: Boolean, default: true },
      audits: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for assigned assets count
userSchema.virtual('assignedAssetsCount').get(function() {
  return this.assignedAssets ? this.assignedAssets.length : 0;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, department: 1 });
userSchema.index({ branch: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'Admin';
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);