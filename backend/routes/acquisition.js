const express = require('express');
const { body, validationResult } = require('express-validator');
const AcquisitionRequest = require('../models/AcquisitionRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/acquisition/requests
// @desc    Get acquisition requests
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const { status, priority, department, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;

    // For non-admin users, filter by their requests or department
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      filter.$or = [
        { requestedBy: req.user.userId },
        { department: req.user.department }
      ];
    }

    const requests = await AcquisitionRequest.find(filter)
      .populate('requestedBy', 'name email department')
      .populate('approvedBy', 'name email')
      .populate('timeline.performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AcquisitionRequest.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get acquisition requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/acquisition/requests
// @desc    Create acquisition request
// @access  Private
router.post('/requests', auth, [
  body('department').isIn(['Engineering', 'Marketing', 'Design', 'HR', 'Finance', 'Operations', 'IT']),
  body('branch').notEmpty().trim().escape(),
  body('justification').notEmpty().trim().escape(),
  body('businessCase').notEmpty().trim().escape(),
  body('items').isArray({ min: 1 }),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      department,
      branch,
      justification,
      businessCase,
      items,
      priority,
      budgetCode,
      notes
    } = req.body;

    // Validate items
    for (const item of items) {
      if (!item.name || !item.category || !item.quantity || !item.unitPrice) {
        return res.status(400).json({ error: 'All item fields are required' });
      }
      item.totalPrice = item.quantity * item.unitPrice;
    }

    const acquisitionRequest = new AcquisitionRequest({
      requestedBy: req.user.userId,
      department,
      branch,
      justification,
      businessCase,
      items,
      priority,
      budgetCode,
      notes,
      timeline: [{
        action: 'Request created',
        description: 'Acquisition request submitted for review',
        performedBy: req.user.userId
      }]
    });

    await acquisitionRequest.save();
    
    await acquisitionRequest.populate([
      { path: 'requestedBy', select: 'name email department' }
    ]);

    res.status(201).json({
      message: 'Acquisition request created successfully',
      request: acquisitionRequest
    });
  } catch (error) {
    console.error('Create acquisition request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/acquisition/requests/:id/approve
// @desc    Approve acquisition request
// @access  Private (Manager/Admin only)
router.put('/requests/:id/approve', auth, [
  body('notes').optional().trim().escape(),
  body('budgetApproval').optional().isBoolean()
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const request = await AcquisitionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Acquisition request not found' });
    }

    if (request.status !== 'submitted' && request.status !== 'under-review') {
      return res.status(400).json({ error: 'Request is not pending approval' });
    }

    const { notes, budgetApproval = true } = req.body;

    request.status = 'approved';
    request.approvedBy = req.user.userId;
    request.approvedDate = new Date();
    if (notes) request.notes = notes;

    request.timeline.push({
      action: 'Request approved',
      description: `Acquisition request approved${budgetApproval ? ' with budget approval' : ''}`,
      performedBy: req.user.userId
    });

    await request.save();

    await request.populate([
      { path: 'requestedBy', select: 'name email department' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Acquisition request approved successfully',
      request
    });
  } catch (error) {
    console.error('Approve acquisition request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/acquisition/requests/:id/quotes
// @desc    Add vendor quote to acquisition request
// @access  Private
router.post('/requests/:id/quotes', auth, [
  body('vendorName').notEmpty().trim().escape(),
  body('vendorEmail').isEmail().normalizeEmail(),
  body('quotedPrice').isNumeric().isFloat({ min: 0 }),
  body('deliveryTime').notEmpty().trim().escape(),
  body('warranty').notEmpty().trim().escape(),
  body('validUntil').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await AcquisitionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Acquisition request not found' });
    }

    const {
      vendorName,
      vendorEmail,
      quotedPrice,
      deliveryTime,
      warranty,
      validUntil,
      notes
    } = req.body;

    const quote = {
      vendorName,
      vendorEmail,
      quotedPrice,
      deliveryTime,
      warranty,
      validUntil,
      notes,
      quoteDate: new Date()
    };

    request.vendorQuotes.push(quote);
    
    request.timeline.push({
      action: 'Vendor quote added',
      description: `Quote received from ${vendorName} - $${quotedPrice}`,
      performedBy: req.user.userId
    });

    await request.save();

    res.json({
      message: 'Vendor quote added successfully',
      quote
    });
  } catch (error) {
    console.error('Add vendor quote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/acquisition/requests/:id/select-vendor
// @desc    Select vendor and create purchase order
// @access  Private (Manager/Admin only)
router.put('/requests/:id/select-vendor', auth, [
  body('quoteId').notEmpty(),
  body('poNumber').optional().trim().escape(),
  body('expectedDelivery').optional().isISO8601()
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const request = await AcquisitionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Acquisition request not found' });
    }

    const { quoteId, poNumber, expectedDelivery } = req.body;

    // Find and select the quote
    const quote = request.vendorQuotes.id(quoteId);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Unselect all quotes and select the chosen one
    request.vendorQuotes.forEach(q => q.selected = false);
    quote.selected = true;

    request.selectedVendor = quote.vendorName;
    request.status = 'ordered';
    if (poNumber) request.poNumber = poNumber;
    if (expectedDelivery) request.expectedDelivery = expectedDelivery;

    request.timeline.push({
      action: 'Vendor selected and PO created',
      description: `Purchase order created for ${quote.vendorName}${poNumber ? ` (PO: ${poNumber})` : ''}`,
      performedBy: req.user.userId
    });

    await request.save();

    res.json({
      message: 'Vendor selected and purchase order created',
      request
    });
  } catch (error) {
    console.error('Select vendor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/acquisition/budget/:department
// @desc    Get department budget information
// @access  Private
router.get('/budget/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Calculate budget utilization
    const requests = await AcquisitionRequest.find({
      department,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31)
      }
    });

    const totalBudget = 100000; // This should come from a budget configuration
    const usedBudget = requests
      .filter(r => r.status === 'approved' || r.status === 'ordered' || r.status === 'delivered' || r.status === 'completed')
      .reduce((sum, r) => sum + r.totalCost, 0);
    
    const pendingRequests = requests.filter(r => r.status === 'submitted' || r.status === 'under-review').length;

    res.json({
      department,
      year,
      totalBudget,
      usedBudget,
      remainingBudget: totalBudget - usedBudget,
      pendingRequests,
      utilizationPercentage: (usedBudget / totalBudget) * 100
    });
  } catch (error) {
    console.error('Get budget info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/acquisition/analytics
// @desc    Get acquisition analytics
// @access  Private (Manager/Admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Request statistics
    const requestStats = await AcquisitionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalCost' }
        }
      }
    ]);

    // Department spending
    const departmentSpending = await AcquisitionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['approved', 'ordered', 'delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$department',
          totalSpent: { $sum: '$totalCost' },
          requestCount: { $sum: 1 },
          avgRequestValue: { $avg: '$totalCost' }
        }
      }
    ]);

    // Category analysis
    const categoryAnalysis = await AcquisitionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          totalQuantity: { $sum: '$items.quantity' },
          totalValue: { $sum: '$items.totalPrice' },
          avgUnitPrice: { $avg: '$items.unitPrice' }
        }
      }
    ]);

    // Vendor performance
    const vendorPerformance = await AcquisitionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          selectedVendor: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$selectedVendor',
          orderCount: { $sum: 1 },
          totalValue: { $sum: '$totalCost' },
          avgDeliveryTime: { $avg: { $subtract: ['$actualDelivery', '$expectedDelivery'] } }
        }
      }
    ]);

    res.json({
      requestStats,
      departmentSpending,
      categoryAnalysis,
      vendorPerformance,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Get acquisition analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/acquisition/requests/:id/deliver
// @desc    Mark acquisition as delivered
// @access  Private
router.put('/requests/:id/deliver', auth, [
  body('actualDelivery').optional().isISO8601(),
  body('notes').optional().trim().escape()
], async (req, res) => {
  try {
    const request = await AcquisitionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Acquisition request not found' });
    }

    if (request.status !== 'ordered') {
      return res.status(400).json({ error: 'Request is not in ordered status' });
    }

    const { actualDelivery, notes } = req.body;

    request.status = 'delivered';
    if (actualDelivery) request.actualDelivery = actualDelivery;
    if (notes) request.notes = notes;

    request.timeline.push({
      action: 'Items delivered',
      description: 'Acquisition items delivered and received',
      performedBy: req.user.userId
    });

    await request.save();

    res.json({
      message: 'Acquisition marked as delivered',
      request
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;