const express = require('express');
const { body, validationResult } = require('express-validator');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/maintenance/requests
// @desc    Get maintenance requests
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // For non-admin users, filter by their requests or assignments
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      filter.$or = [
        { requestedBy: req.user.userId },
        { assignedTo: req.user.userId }
      ];
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate('asset', 'name serialNumber category')
      .populate('requestedBy', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MaintenanceRequest.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/maintenance/requests
// @desc    Create maintenance request
// @access  Private
router.post('/requests', auth, [
  body('title').notEmpty().trim().escape(),
  body('description').notEmpty().trim().escape(),
  body('asset').isMongoId(),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  body('category').isIn(['hardware', 'software', 'network', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, asset, priority, category } = req.body;

    // Verify asset exists
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const maintenanceRequest = new MaintenanceRequest({
      title,
      description,
      asset,
      requestedBy: req.user.userId,
      priority,
      category,
      workLog: [{
        action: 'Request created',
        description: 'Maintenance request submitted',
        performedBy: req.user.userId
      }]
    });

    await maintenanceRequest.save();
    
    await maintenanceRequest.populate([
      { path: 'asset', select: 'name serialNumber category' },
      { path: 'requestedBy', select: 'name email department' }
    ]);

    res.status(201).json({
      message: 'Maintenance request created successfully',
      request: maintenanceRequest
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/maintenance/requests/:id
// @desc    Get maintenance request by ID
// @access  Private
router.get('/requests/:id', auth, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('asset', 'name serialNumber category branch location')
      .populate('requestedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('approvedBy', 'name email')
      .populate('workLog.performedBy', 'name');

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check permissions
    const canView = req.user.role === 'Admin' || 
                   req.user.role === 'Manager' ||
                   request.requestedBy._id.toString() === req.user.userId ||
                   (request.assignedTo && request.assignedTo._id.toString() === req.user.userId);

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/maintenance/requests/:id
// @desc    Update maintenance request
// @access  Private
router.put('/requests/:id', auth, [
  body('status').optional().isIn(['pending', 'approved', 'in-progress', 'completed',   'cancelled', 'rejected']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('estimatedCost').optional().isNumeric(),
  body('laborCost').optional().isNumeric(),
  body('partsCost').optional().isNumeric(),
  body('timeSpent').optional().isNumeric(),
  body('notes').optional().trim().escape(),
  body('resolution').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'Admin' || 
                     req.user.role === 'Manager' ||
                     (request.assignedTo && request.assignedTo.toString() === req.user.userId);

    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allowedUpdates = [
      'status', 'priority', 'estimatedCost', 'actualCost', 'laborCost', 
      'partsCost', 'timeSpent', 'notes', 'resolution', 'assignedTo',
      'estimatedCompletion', 'warrantyUsed'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle status changes
    if (updates.status) {
      if (updates.status === 'approved' && req.user.role === 'Manager') {
        updates.approvedBy = req.user.userId;
        updates.approvedDate = new Date();
      }
      
      if (updates.status === 'completed') {
        updates.actualCompletion = new Date();
        updates.actualCost = (updates.laborCost || request.laborCost || 0) + 
                            (updates.partsCost || request.partsCost || 0);
      }

      // Add to work log
      request.workLog.push({
        action: `Status changed to ${updates.status}`,
        description: updates.notes || `Request status updated to ${updates.status}`,
        performedBy: req.user.userId,
        timeSpent: updates.timeSpent || 0
      });
    }

    Object.assign(request, updates);
    await request.save();

    await request.populate([
      { path: 'asset', select: 'name serialNumber category' },
      { path: 'requestedBy', select: 'name email department' },
      { path: 'assignedTo', select: 'name email department' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Maintenance request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/maintenance/requests/:id/assign
// @desc    Assign maintenance request
// @access  Private (Manager/Admin only)
router.post('/requests/:id/assign', auth, [
  body('assignedTo').isMongoId(),
  body('estimatedCompletion').optional().isISO8601(),
  body('estimatedCost').optional().isNumeric(),
  body('notes').optional().trim().escape()
], async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    const { assignedTo, estimatedCompletion, estimatedCost, notes } = req.body;

    // Verify assignee exists
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee not found' });
    }

    // Update request
    request.assignedTo = assignedTo;
    request.status = 'approved';
    request.approvedBy = req.user.userId;
    request.approvedDate = new Date();
    
    if (estimatedCompletion) request.estimatedCompletion = estimatedCompletion;
    if (estimatedCost) request.estimatedCost = estimatedCost;
    if (notes) request.notes = notes;

    // Add to work log
    request.workLog.push({
      action: 'Request assigned',
      description: `Assigned to ${assignee.name}`,
      performedBy: req.user.userId
    });

    await request.save();

    await request.populate([
      { path: 'asset', select: 'name serialNumber category' },
      { path: 'requestedBy', select: 'name email department' },
      { path: 'assignedTo', select: 'name email department' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Maintenance request assigned successfully',
      request
    });
  } catch (error) {
    console.error('Assign maintenance request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/maintenance/requests/:id/attachments
// @desc    Upload attachment to maintenance request
// @access  Private
router.post('/requests/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check permissions
    const canUpload = req.user.role === 'Admin' || 
                     req.user.role === 'Manager' ||
                     request.requestedBy.toString() === req.user.userId ||
                     (request.assignedTo && request.assignedTo.toString() === req.user.userId);

    if (!canUpload) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const attachment = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user.userId
    };

    request.attachments.push(attachment);
    await request.save();

    res.json({
      message: 'Attachment uploaded successfully',
      attachment
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/maintenance/analytics
// @desc    Get maintenance analytics
// @access  Private (Manager/Admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get basic statistics
    const stats = await MaintenanceRequest.getStatistics();
    
    // Get cost analytics
    const costAnalytics = await MaintenanceRequest.getCostAnalytics(start, end);
    
    // Get average resolution time
    const avgResolutionTime = await MaintenanceRequest.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get requests by category
    const categoryStats = await MaintenanceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCost: { $avg: '$actualCost' }
        }
      }
    ]);

    res.json({
      stats,
      costAnalytics,
      avgResolutionTime: avgResolutionTime[0]?.avgDuration || 0,
      categoryStats,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Get maintenance analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;