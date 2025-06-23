const express = require('express');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all vendors
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { specialization, rating, availability, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (specialization) filter.specialization = specialization;
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    if (availability) filter.availability = availability;

    const vendors = await Vendor.find(filter)
      .sort({ rating: -1, hourlyRate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vendor.countDocuments(filter);

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/vendors
// @desc    Create new vendor
// @access  Private (Admin only)
router.post('/', auth, [
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('specialization').isArray(),
  body('responseTime').notEmpty().trim(),
  body('hourlyRate').optional().isNumeric().isFloat({ min: 0 })
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if vendor with email already exists
    const existingVendor = await Vendor.findOne({ email: req.body.email });
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor with this email already exists' });
    }

    const vendor = new Vendor(req.body);
    await vendor.save();

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/vendors/:id
// @desc    Update vendor
// @access  Private (Admin only)
router.put('/:id', auth, [
  body('name').optional().notEmpty().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().notEmpty().trim(),
  body('specialization').optional().isArray(),
  body('rating').optional().isNumeric().isFloat({ min: 1, max: 5 }),
  body('hourlyRate').optional().isNumeric().isFloat({ min: 0 })
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const allowedUpdates = [
      'name', 'email', 'phone', 'address', 'specialization', 
      'rating', 'responseTime', 'hourlyRate', 'contractDetails',
      'certifications', 'serviceAreas', 'availability'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    res.json({
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/vendors/:id
// @desc    Deactivate vendor
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    vendor.isActive = false;
    await vendor.save();

    res.json({ message: 'Vendor deactivated successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/vendors/specializations/list
// @desc    Get list of all specializations
// @access  Private
router.get('/specializations/list', auth, async (req, res) => {
  try {
    const specializations = [
      'Hardware', 'Software', 'Network', 'Mobile', 'Security', 
      'Apple Products', 'Laptop Repair', 'Infrastructure', 'System Integration'
    ];
    
    res.json(specializations);
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;