const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// In-memory settings store (in production, use database)
let systemSettings = {
  depreciation: {
    method: 'straight-line', // 'straight-line', 'declining-balance', 'custom'
    defaultLifespan: {
      'Electronics': 3,
      'Furniture': 7,
      'Vehicles': 5,
      'Equipment': 5,
      'Laptop': 3,
      'Monitor': 5,
      'Mobile': 2,
      'Tablet': 3,
      'Desktop': 4
    },
    customRates: {
      'Electronics': 25, // Annual depreciation rate %
      'Furniture': 10,
      'Vehicles': 20,
      'Equipment': 15,
      'Laptop': 30,
      'Monitor': 15,
      'Mobile': 40,
      'Tablet': 25,
      'Desktop': 20
    },
    salvageValuePercentage: 10 // Percentage of original value retained
  },
  maintenance: {
    autoAssignRequests: true,
    emailNotifications: true,
    warrantyAlerts: true,
    maintenanceReminders: true,
    defaultWarrantyPeriod: 12, // months
    maxFileSize: 10, // MB
    allowedFileTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  },
  audit: {
    frequency: 'quarterly', // 'monthly', 'quarterly', 'annually'
    reminderDays: 30,
    autoGenerateReports: true
  },
  system: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  }
};

// @route   GET /api/settings
// @desc    Get all system settings
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(systemSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/settings/depreciation
// @desc    Update depreciation settings
// @access  Private (Admin only)
router.put('/depreciation', auth, [
  body('method').optional().isIn(['straight-line', 'declining-balance', 'custom']),
  body('defaultLifespan').optional().isObject(),
  body('customRates').optional().isObject(),
  body('salvageValuePercentage').optional().isNumeric().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update depreciation settings
    const allowedFields = ['method', 'defaultLifespan', 'customRates', 'salvageValuePercentage'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        systemSettings.depreciation[field] = req.body[field];
      }
    });

    res.json({
      message: 'Depreciation settings updated successfully',
      settings: systemSettings.depreciation
    });
  } catch (error) {
    console.error('Update depreciation settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/settings/maintenance
// @desc    Update maintenance settings
// @access  Private (Admin only)
router.put('/maintenance', auth, [
  body('autoAssignRequests').optional().isBoolean(),
  body('emailNotifications').optional().isBoolean(),
  body('warrantyAlerts').optional().isBoolean(),
  body('maintenanceReminders').optional().isBoolean(),
  body('defaultWarrantyPeriod').optional().isNumeric().isInt({ min: 1, max: 120 }),
  body('maxFileSize').optional().isNumeric().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update maintenance settings
    const allowedFields = [
      'autoAssignRequests', 'emailNotifications', 'warrantyAlerts', 
      'maintenanceReminders', 'defaultWarrantyPeriod', 'maxFileSize', 
      'allowedFileTypes'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        systemSettings.maintenance[field] = req.body[field];
      }
    });

    res.json({
      message: 'Maintenance settings updated successfully',
      settings: systemSettings.maintenance
    });
  } catch (error) {
    console.error('Update maintenance settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/settings/audit
// @desc    Update audit settings
// @access  Private (Admin only)
router.put('/audit', auth, [
  body('frequency').optional().isIn(['monthly', 'quarterly', 'annually']),
  body('reminderDays').optional().isNumeric().isInt({ min: 1, max: 365 }),
  body('autoGenerateReports').optional().isBoolean()
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update audit settings
    const allowedFields = ['frequency', 'reminderDays', 'autoGenerateReports'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        systemSettings.audit[field] = req.body[field];
      }
    });

    res.json({
      message: 'Audit settings updated successfully',
      settings: systemSettings.audit
    });
  } catch (error) {
    console.error('Update audit settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/settings/depreciation/calculate
// @desc    Calculate depreciation for an asset
// @access  Private
router.get('/depreciation/calculate', auth, async (req, res) => {
  try {
    const { 
      purchasePrice, 
      purchaseDate, 
      category, 
      currentDate = new Date().toISOString() 
    } = req.query;

    if (!purchasePrice || !purchaseDate || !category) {
      return res.status(400).json({ 
        error: 'purchasePrice, purchaseDate, and category are required' 
      });
    }

    const depreciation = calculateAssetDepreciation(
      parseFloat(purchasePrice),
      new Date(purchaseDate),
      category,
      new Date(currentDate)
    );

    res.json(depreciation);
  } catch (error) {
    console.error('Calculate depreciation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate depreciation
function calculateAssetDepreciation(purchasePrice, purchaseDate, category, currentDate = new Date()) {
  const settings = systemSettings.depreciation;
  const ageInYears = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
  
  let currentValue = purchasePrice;
  let depreciationAmount = 0;
  let depreciationRate = 0;
  
  const lifespan = settings.defaultLifespan[category] || 5;
  const salvageValue = (purchasePrice * settings.salvageValuePercentage) / 100;
  
  switch (settings.method) {
    case 'straight-line':
      const annualDepreciation = (purchasePrice - salvageValue) / lifespan;
      depreciationAmount = Math.min(annualDepreciation * ageInYears, purchasePrice - salvageValue);
      currentValue = Math.max(purchasePrice - depreciationAmount, salvageValue);
      depreciationRate = (depreciationAmount / purchasePrice) * 100;
      break;
      
    case 'declining-balance':
      const rate = settings.customRates[category] || 20;
      currentValue = purchasePrice * Math.pow(1 - (rate / 100), ageInYears);
      currentValue = Math.max(currentValue, salvageValue);
      depreciationAmount = purchasePrice - currentValue;
      depreciationRate = (depreciationAmount / purchasePrice) * 100;
      break;
      
    case 'custom':
      const customRate = settings.customRates[category] || 15;
      depreciationAmount = (purchasePrice * customRate * ageInYears) / 100;
      depreciationAmount = Math.min(depreciationAmount, purchasePrice - salvageValue);
      currentValue = Math.max(purchasePrice - depreciationAmount, salvageValue);
      depreciationRate = (depreciationAmount / purchasePrice) * 100;
      break;
  }
  
  return {
    purchasePrice,
    currentValue: Math.round(currentValue * 100) / 100,
    depreciationAmount: Math.round(depreciationAmount * 100) / 100,
    depreciationRate: Math.round(depreciationRate * 100) / 100,
    ageInYears: Math.round(ageInYears * 100) / 100,
    method: settings.method,
    salvageValue: Math.round(salvageValue * 100) / 100,
    remainingLifespan: Math.max(0, lifespan - ageInYears)
  };
}

module.exports = router;