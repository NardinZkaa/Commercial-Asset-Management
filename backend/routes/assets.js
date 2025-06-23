const express = require('express');
const { body, validationResult } = require('express-validator');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/assets
// @desc    Get all assets with filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      search, 
      category, 
      status, 
      branch, 
      assignedTo,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (assignedTo) filter.assignedTo = assignedTo;

    const assets = await Asset.find(filter)
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Asset.countDocuments(filter);

    // Calculate depreciation for each asset
    const assetsWithDepreciation = assets.map(asset => {
      const assetObj = asset.toObject();
      assetObj.depreciation = calculateDepreciation(asset);
      assetObj.age = calculateAge(asset.purchaseDate);
      return assetObj;
    });

    res.json({
      assets: assetsWithDepreciation,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/assets
// @desc    Create new asset
// @access  Private
router.post('/', auth, [
  body('name').notEmpty().trim().escape(),
  body('category').isIn(['Electronics', 'Furniture', 'Vehicles', 'Equipment', 'Laptop', 'Monitor', 'Mobile', 'Tablet', 'Desktop']),
  body('serialNumber').notEmpty().trim().escape(),
  body('branch').notEmpty().trim().escape(),
  body('location').notEmpty().trim().escape(),
  body('purchasePrice').isNumeric().isFloat({ min: 0 }),
  body('currentValue').isNumeric().isFloat({ min: 0 }),
  body('purchaseDate').isISO8601(),
  body('vendor').notEmpty().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if serial number already exists
    const existingAsset = await Asset.findOne({ serialNumber: req.body.serialNumber });
    if (existingAsset) {
      return res.status(400).json({ error: 'Asset with this serial number already exists' });
    }

    // Generate QR code identifier
    const qrCodeIdentifier = `ASSET-${req.body.serialNumber}-${Date.now()}`;

    const asset = new Asset({
      ...req.body,
      qrCodeIdentifier,
      nextAuditDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    });

    await asset.save();
    await asset.populate('assignedTo', 'name email department');

    res.status(201).json({
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/assets/:id
// @desc    Get asset by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('maintenanceHistory');

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const assetObj = asset.toObject();
    assetObj.depreciation = calculateDepreciation(asset);
    assetObj.age = calculateAge(asset.purchaseDate);

    res.json(assetObj);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/assets/:id
// @desc    Update asset
// @access  Private
router.put('/:id', auth, [
  body('name').optional().notEmpty().trim().escape(),
  body('category').optional().isIn(['Electronics', 'Furniture', 'Vehicles', 'Equipment', 'Laptop', 'Monitor', 'Mobile', 'Tablet', 'Desktop']),
  body('status').optional().isIn(['Active', 'Inactive', 'Under Maintenance', 'Retired']),
  body('condition').optional().isIn(['Excellent', 'Good', 'Fair', 'Poor']),
  body('currentValue').optional().isNumeric().isFloat({ min: 0 }),
  body('location').optional().notEmpty().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'category', 'status', 'condition', 'location', 
      'currentValue', 'assignedTo', 'description', 'warranty', 
      'warrantyExpiry', 'vendor'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        asset[field] = req.body[field];
      }
    });

    await asset.save();
    await asset.populate('assignedTo', 'name email department');

    const assetObj = asset.toObject();
    assetObj.depreciation = calculateDepreciation(asset);
    assetObj.age = calculateAge(asset.purchaseDate);

    res.json({
      message: 'Asset updated successfully',
      asset: assetObj
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/assets/:id
// @desc    Delete asset
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/assets/:id/photo
// @desc    Upload asset photo
// @access  Private
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    asset.photo = req.file.path;
    await asset.save();

    res.json({
      message: 'Photo uploaded successfully',
      photoPath: req.file.path
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/assets/:id/qr
// @desc    Generate QR code for asset
// @access  Private
router.get('/:id/qr', auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const QRCode = require('qrcode');
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(asset.qrCodeIdentifier, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      identifier: asset.qrCodeIdentifier
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/assets/analytics/depreciation
// @desc    Get depreciation analytics
// @access  Private
router.get('/analytics/depreciation', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ status: { $ne: 'Retired' } });
    
    const depreciationData = assets.map(asset => {
      const depreciation = calculateDepreciation(asset);
      const age = calculateAge(asset.purchaseDate);
      
      return {
        id: asset._id,
        name: asset.name,
        category: asset.category,
        purchasePrice: asset.purchasePrice,
        currentValue: asset.currentValue,
        depreciation: depreciation,
        age: age,
        depreciationAmount: asset.purchasePrice - asset.currentValue
      };
    });

    // Group by category
    const categoryDepreciation = depreciationData.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = {
          totalPurchaseValue: 0,
          totalCurrentValue: 0,
          assetCount: 0,
          avgDepreciation: 0
        };
      }
      
      acc[asset.category].totalPurchaseValue += asset.purchasePrice;
      acc[asset.category].totalCurrentValue += asset.currentValue;
      acc[asset.category].assetCount += 1;
      
      return acc;
    }, {});

    // Calculate average depreciation per category
    Object.keys(categoryDepreciation).forEach(category => {
      const data = categoryDepreciation[category];
      data.avgDepreciation = ((data.totalPurchaseValue - data.totalCurrentValue) / data.totalPurchaseValue) * 100;
    });

    res.json({
      assets: depreciationData,
      categoryDepreciation
    });
  } catch (error) {
    console.error('Get depreciation analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions
function calculateDepreciation(asset) {
  if (!asset.purchasePrice || !asset.currentValue) return 0;
  return ((asset.purchasePrice - asset.currentValue) / asset.purchasePrice * 100).toFixed(2);
}

function calculateAge(purchaseDate) {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const diffTime = Math.abs(now - purchase);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
}

module.exports = router;