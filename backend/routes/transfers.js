const express = require('express');
const { body, validationResult } = require('express-validator');
const TransferRequest = require('../models/Transfer');
const Asset = require('../models/Asset');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transfers
// @desc    Get transfer requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, transferType, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (transferType) filter.transferType = transferType;

    // For non-admin users, filter by their requests or approvals
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      filter.$or = [
        { requestedBy: req.user.userId },
        { fromUser: req.user.userId },
        { toUser: req.user.userId }
      ];
    }

    const transfers = await TransferRequest.find(filter)
      .populate('asset', 'name serialNumber category currentValue')
      .populate('requestedBy', 'name email department')
      .populate('fromUser', 'name email department')
      .populate('toUser', 'name email department')
      .populate('approvedBy', 'name email')
      .populate('timeline.performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TransferRequest.countDocuments(filter);

    res.json({
      transfers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/transfers
// @desc    Create transfer request
// @access  Private
router.post('/', auth, [
  body('assetId').isMongoId(),
  body('transferType').isIn(['user', 'branch', 'location']),
  body('reason').notEmpty().trim().escape(),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      assetId, 
      transferType, 
      fromUserId, 
      toUserId, 
      fromBranch, 
      toBranch, 
      fromLocation, 
      toLocation,
      reason, 
      priority, 
      requiresApproval = true,
      notes 
    } = req.body;

    // Verify asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Validate transfer type specific fields
    if (transferType === 'user' && (!toUserId)) {
      return res.status(400).json({ error: 'Target user required for user transfer' });
    }
    if (transferType === 'branch' && (!fromBranch || !toBranch)) {
      return res.status(400).json({ error: 'Source and target branches required for branch transfer' });
    }
    if (transferType === 'location' && (!fromLocation || !toLocation)) {
      return res.status(400).json({ error: 'Source and target locations required for location transfer' });
    }

    const transferRequest = new TransferRequest({
      asset: assetId,
      transferType,
      fromUser: fromUserId,
      toUser: toUserId,
      fromBranch,
      toBranch,
      fromLocation,
      toLocation,
      reason,
      requestedBy: req.user.userId,
      priority,
      requiresApproval,
      notes,
      timeline: [{
        action: 'Transfer request created',
        description: `${transferType} transfer request submitted`,
        performedBy: req.user.userId
      }]
    });

    await transferRequest.save();
    
    await transferRequest.populate([
      { path: 'asset', select: 'name serialNumber category' },
      { path: 'requestedBy', select: 'name email department' },
      { path: 'fromUser', select: 'name email' },
      { path: 'toUser', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Transfer request created successfully',
      transfer: transferRequest
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/transfers/:id/approve
// @desc    Approve transfer request
// @access  Private (Manager/Admin only)
router.put('/:id/approve', auth, [
  body('notes').optional().trim().escape(),
  body('estimatedDelivery').optional().isISO8601()
], async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const transfer = await TransferRequest.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({ error: 'Transfer request is not pending approval' });
    }

    const { notes, estimatedDelivery } = req.body;

    transfer.status = 'approved';
    transfer.approvedBy = req.user.userId;
    transfer.approvedDate = new Date();
    if (notes) transfer.notes = notes;
    if (estimatedDelivery) transfer.estimatedDelivery = estimatedDelivery;

    transfer.timeline.push({
      action: 'Transfer approved',
      description: 'Transfer request approved by manager',
      performedBy: req.user.userId
    });

    await transfer.save();

    await transfer.populate([
      { path: 'asset', select: 'name serialNumber category' },
      { path: 'requestedBy', select: 'name email department' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Transfer request approved successfully',
      transfer
    });
  } catch (error) {
    console.error('Approve transfer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/transfers/:id/complete
// @desc    Mark transfer as completed
// @access  Private
router.put('/:id/complete', auth, [
  body('actualDelivery').optional().isISO8601(),
  body('notes').optional().trim().escape()
], async (req, res) => {
  try {
    const transfer = await TransferRequest.findById(req.params.id)
      .populate('asset')
      .populate('toUser');
    
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    if (transfer.status !== 'approved' && transfer.status !== 'in-transit') {
      return res.status(400).json({ error: 'Transfer is not ready for completion' });
    }

    const { actualDelivery, notes } = req.body;

    // Update transfer status
    transfer.status = 'completed';
    transfer.completedDate = new Date();
    if (actualDelivery) transfer.actualDelivery = actualDelivery;
    if (notes) transfer.notes = notes;

    // Update asset assignment based on transfer type
    if (transfer.transferType === 'user' && transfer.toUser) {
      transfer.asset.assignedTo = transfer.toUser._id;
    }
    if (transfer.transferType === 'branch' && transfer.toBranch) {
      transfer.asset.branch = transfer.toBranch;
    }
    if (transfer.transferType === 'location' && transfer.toLocation) {
      transfer.asset.location = transfer.toLocation;
    }

    await transfer.asset.save();

    transfer.timeline.push({
      action: 'Transfer completed',
      description: 'Asset transfer completed successfully',
      performedBy: req.user.userId
    });

    await transfer.save();

    res.json({
      message: 'Transfer completed successfully',
      transfer
    });
  } catch (error) {
    console.error('Complete transfer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/transfers/analytics
// @desc    Get transfer analytics
// @access  Private (Manager/Admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Transfer statistics
    const stats = await TransferRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCost: { $avg: '$transferCost' },
          totalCost: { $sum: '$transferCost' }
        }
      }
    ]);

    // Transfer trends by month
    const trends = await TransferRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          totalCost: { $sum: '$transferCost' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Transfer types distribution
    const typeDistribution = await TransferRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$transferType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats,
      trends,
      typeDistribution,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Get transfer analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;