const express = require('express');
const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { category, branch, status } = req.query;
    
    // Build filter
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (branch && branch !== 'all') filter.branch = branch;
    if (status && status !== 'all') filter.status = status;

    // Get asset counts by status
    const assetStatus = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Get lifecycle metrics
    const totalAssets = await Asset.countDocuments(filter);
    const activeAssets = await Asset.countDocuments({ ...filter, status: 'Active' });
    const maintenanceAssets = await Asset.countDocuments({ ...filter, status: 'Under Maintenance' });
    const retiredAssets = await Asset.countDocuments({ ...filter, status: 'Retired' });

    const lifecycle = {
      inUse: totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0,
      underMaintenance: totalAssets > 0 ? Math.round((maintenanceAssets / totalAssets) * 100) : 0,
      retired: totalAssets > 0 ? Math.round((retiredAssets / totalAssets) * 100) : 0,
      avgLifespanYears: 5 // This could be calculated based on actual data
    };

    // Get ownership changes by branch
    const ownershipChanges = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $project: { branch: '$_id', count: 1, _id: 0 } }
    ]);

    // Get asset value trends
    const assetValueTrend = await Asset.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$purchaseDate' } },
          totalValue: { $sum: '$currentValue' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 12 }
    ]);

    // Get category distribution
    const categoryDistribution = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    // Get depreciation data
    const depreciationData = await Asset.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          totalPurchase: { $sum: '$purchasePrice' },
          totalCurrent: { $sum: '$currentValue' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          totalPurchase: 1,
          totalCurrent: 1,
          count: 1,
          depreciationRate: {
            $multiply: [
              { $divide: [{ $subtract: ['$totalPurchase', '$totalCurrent'] }, '$totalPurchase'] },
              100
            ]
          },
          _id: 0
        }
      }
    ]);

    res.json({
      lifecycle,
      assetStatus,
      ownershipChanges,
      assetValueTrend,
      categoryDistribution,
      depreciationData
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/depreciation
// @desc    Get depreciation analytics
// @access  Private
router.get('/depreciation', auth, async (req, res) => {
  try {
    const { category, timeframe = '12months' } = req.query;
    
    const filter = {};
    if (category && category !== 'all') filter.category = category;

    // Calculate depreciation for each asset
    const assets = await Asset.find(filter);
    
    const depreciationAnalytics = assets.map(asset => {
      const age = calculateAge(asset.purchaseDate);
      const depreciation = calculateDepreciation(asset);
      const annualDepreciation = age > 0 ? depreciation / age : 0;
      
      return {
        id: asset._id,
        name: asset.name,
        category: asset.category,
        purchasePrice: asset.purchasePrice,
        currentValue: asset.currentValue,
        age,
        depreciation,
        annualDepreciation,
        depreciationAmount: asset.purchasePrice - asset.currentValue
      };
    });

    // Group by category
    const categoryAnalytics = depreciationAnalytics.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = {
          totalAssets: 0,
          totalPurchaseValue: 0,
          totalCurrentValue: 0,
          avgDepreciation: 0,
          avgAnnualDepreciation: 0
        };
      }
      
      const cat = acc[asset.category];
      cat.totalAssets += 1;
      cat.totalPurchaseValue += asset.purchasePrice;
      cat.totalCurrentValue += asset.currentValue;
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(categoryAnalytics).forEach(category => {
      const data = categoryAnalytics[category];
      data.avgDepreciation = ((data.totalPurchaseValue - data.totalCurrentValue) / data.totalPurchaseValue) * 100;
      
      const categoryAssets = depreciationAnalytics.filter(a => a.category === category);
      data.avgAnnualDepreciation = categoryAssets.reduce((sum, a) => sum + a.annualDepreciation, 0) / categoryAssets.length;
    });

    res.json({
      assets: depreciationAnalytics,
      categoryAnalytics,
      summary: {
        totalAssets: assets.length,
        totalPurchaseValue: assets.reduce((sum, a) => sum + a.purchasePrice, 0),
        totalCurrentValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
        totalDepreciationAmount: assets.reduce((sum, a) => sum + (a.purchasePrice - a.currentValue), 0)
      }
    });
  } catch (error) {
    console.error('Get depreciation analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/maintenance-costs
// @desc    Get maintenance cost analytics
// @access  Private
router.get('/maintenance-costs', auth, async (req, res) => {
  try {
    const { timeframe = '12months' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '24months':
        startDate.setMonth(endDate.getMonth() - 24);
        break;
      default: // 12months
        startDate.setMonth(endDate.getMonth() - 12);
    }

    // Get maintenance costs by month
    const monthlyCosts = await MaintenanceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed',
          actualCost: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalCost: { $sum: '$actualCost' },
          laborCost: { $sum: '$laborCost' },
          partsCost: { $sum: '$partsCost' },
          requestCount: { $sum: 1 },
          avgCost: { $avg: '$actualCost' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get costs by category
    const categoryCosts = await MaintenanceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed',
          actualCost: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$actualCost' },
          requestCount: { $sum: 1 },
          avgCost: { $avg: '$actualCost' }
        }
      }
    ]);

    // Get total metrics
    const totalMetrics = await MaintenanceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$actualCost' },
          totalLaborCost: { $sum: '$laborCost' },
          totalPartsCost: { $sum: '$partsCost' },
          totalRequests: { $sum: 1 },
          avgCost: { $avg: '$actualCost' },
          avgTimeSpent: { $avg: '$timeSpent' }
        }
      }
    ]);

    res.json({
      monthlyCosts,
      categoryCosts,
      totalMetrics: totalMetrics[0] || {
        totalCost: 0,
        totalLaborCost: 0,
        totalPartsCost: 0,
        totalRequests: 0,
        avgCost: 0,
        avgTimeSpent: 0
      },
      timeframe,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get maintenance cost analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions
function calculateAge(purchaseDate) {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const diffTime = Math.abs(now - purchase);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
}

function calculateDepreciation(asset) {
  if (!asset.purchasePrice || !asset.currentValue) return 0;
  return ((asset.purchasePrice - asset.currentValue) / asset.purchasePrice * 100);
}

module.exports = router;