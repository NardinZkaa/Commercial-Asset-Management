const express = require('express');
const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/Transfer');
const AcquisitionRequest = require('../models/AcquisitionRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

// @route   GET /api/dashboard/metrics
// @desc    Get dashboard metrics
// @access  Private
router.get('/metrics', auth, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default: // 30d
        startDate.setDate(endDate.getDate() - 30);
    }

    // Asset metrics
    const totalAssets = await Asset.countDocuments();
    const activeAssets = await Asset.countDocuments({ status: 'Active' });
    const totalValue = await Asset.aggregate([
      { $group: { _id: null, total: { $sum: '$currentValue' } } }
    ]);

    // Maintenance metrics
    const pendingMaintenance = await MaintenanceRequest.countDocuments({ status: 'pending' });
    const overdueMaintenance = await MaintenanceRequest.countDocuments({
      status: { $in: ['pending', 'in-progress'] },
      estimatedCompletion: { $lt: new Date() }
    });

    const maintenanceCosts = await MaintenanceRequest.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$actualCost' },
          avgCost: { $avg: '$actualCost' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Transfer metrics
    const pendingTransfers = await TransferRequest.countDocuments({ status: 'pending' });
    const completedTransfers = await TransferRequest.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Acquisition metrics
    const pendingAcquisitions = await AcquisitionRequest.countDocuments({ status: 'submitted' });
    const approvedAcquisitions = await AcquisitionRequest.countDocuments({
      status: 'approved',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate utilization rate
    const utilizationRate = totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0;

    // Calculate compliance score (simplified)
    const complianceScore = 94; // This would be calculated based on actual compliance data

    res.json({
      totalAssets,
      activeAssets,
      totalValue: totalValue[0]?.total || 0,
      pendingMaintenance,
      overdueMaintenance,
      maintenanceRequired: pendingMaintenance + overdueMaintenance,
      utilizationRate,
      complianceScore,
      monthlyMaintenanceCost: maintenanceCosts[0]?.totalCost || 0,
      avgMaintenanceCost: maintenanceCosts[0]?.avgCost || 0,
      totalMaintenanceCost: maintenanceCosts[0]?.totalCost || 0,
      pendingTransfers,
      completedTransfers,
      pendingAcquisitions,
      approvedAcquisitions,
      timeRange,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get dashboard alerts
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = [];

    // Warranty expiration alerts
    const expiringWarranties = await Asset.find({
      warrantyExpiry: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    }).countDocuments();

    if (expiringWarranties > 0) {
      alerts.push({
        id: 'warranty-expiring',
        type: 'warning',
        title: 'Warranties Expiring Soon',
        message: `${expiringWarranties} assets have warranties expiring within 30 days`,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        priority: 'medium'
      });
    }

    // Overdue maintenance alerts
    const overdueMaintenance = await MaintenanceRequest.countDocuments({
      status: { $in: ['pending', 'in-progress'] },
      estimatedCompletion: { $lt: new Date() }
    });

    if (overdueMaintenance > 0) {
      alerts.push({
        id: 'maintenance-overdue',
        type: 'error',
        title: 'Overdue Maintenance',
        message: `${overdueMaintenance} maintenance requests are overdue`,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        priority: 'high'
      });
    }

    // Pending approvals
    const pendingApprovals = await TransferRequest.countDocuments({ status: 'pending' }) +
                            await AcquisitionRequest.countDocuments({ status: 'submitted' });

    if (pendingApprovals > 0) {
      alerts.push({
        id: 'pending-approvals',
        type: 'info',
        title: 'Pending Approvals',
        message: `${pendingApprovals} requests are waiting for approval`,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        priority: 'medium'
      });
    }

    // Budget alerts
    const highValueAcquisitions = await AcquisitionRequest.countDocuments({
      status: 'submitted',
      totalCost: { $gte: 10000 }
    });

    if (highValueAcquisitions > 0) {
      alerts.push({
        id: 'high-value-acquisitions',
        type: 'warning',
        title: 'High-Value Acquisitions',
        message: `${highValueAcquisitions} high-value acquisition requests need review`,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        priority: 'high'
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error('Get dashboard alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get recent activity
// @access  Private
router.get('/activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent activities from different modules
    const recentAssets = await Asset.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt')
      .lean();

    const recentMaintenance = await MaintenanceRequest.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('asset', 'name')
      .select('title status createdAt asset')
      .lean();

    const recentTransfers = await TransferRequest.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('asset', 'name')
      .select('transferId status createdAt asset')
      .lean();

    const recentAcquisitions = await AcquisitionRequest.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select('requestId status totalCost createdAt')
      .lean();

    // Combine and format activities
    const activities = [];

    recentAssets.forEach(asset => {
      activities.push({
        id: `asset-${asset._id}`,
        type: 'asset',
        title: 'New Asset Registered',
        description: `${asset.name} added to inventory`,
        timestamp: asset.createdAt,
        icon: 'Package'
      });
    });

    recentMaintenance.forEach(request => {
      activities.push({
        id: `maintenance-${request._id}`,
        type: 'maintenance',
        title: 'Maintenance Request',
        description: `${request.title} - ${request.status}`,
        timestamp: request.createdAt,
        icon: 'Wrench'
      });
    });

    recentTransfers.forEach(transfer => {
      activities.push({
        id: `transfer-${transfer._id}`,
        type: 'transfer',
        title: 'Asset Transfer',
        description: `${transfer.asset?.name} transfer ${transfer.status}`,
        timestamp: transfer.createdAt,
        icon: 'ArrowRightLeft'
      });
    });

    recentAcquisitions.forEach(acquisition => {
      activities.push({
        id: `acquisition-${acquisition._id}`,
        type: 'acquisition',
        title: 'Acquisition Request',
        description: `${acquisition.requestId} - $${acquisition.totalCost.toLocaleString()}`,
        timestamp: acquisition.createdAt,
        icon: 'ShoppingCart'
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json(limitedActivities);
  } catch (error) {
    console.error('Get dashboard activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;