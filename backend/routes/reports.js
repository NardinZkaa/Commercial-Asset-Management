const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/Transfer');
const AcquisitionRequest = require('../models/AcquisitionRequest');
const auth = require('../middleware/auth');
const { jsPDF } = require('jspdf');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (type) filter['config.type'] = type;
    if (status) filter.status = status;

    // For non-admin users, filter by their reports
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      filter.generatedBy = req.user.userId;
    }

    const reports = await Report.find(filter)
      .populate('generatedBy', 'name email department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/reports/generate
// @desc    Generate new report
// @access  Private
router.post('/generate', auth, [
  body('type').isIn(['asset-inventory', 'maintenance-summary', 'depreciation-analysis', 'audit-compliance', 'cost-analysis', 'transfer-summary', 'acquisition-summary']),
  body('format').isIn(['pdf', 'csv', 'excel']),
  body('title').notEmpty().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const startTime = Date.now();
    const { title, description, config } = req.body;

    // Create report record
    const report = new Report({
      title,
      description,
      generatedBy: req.user.userId,
      config,
      filePath: '', // Will be set after generation
      fileSize: 0,
      status: 'generating'
    });

    await report.save();

    try {
      // Generate report based on type
      let reportData;
      let recordCount = 0;
      let totalValue = 0;

      switch (config.type) {
        case 'asset-inventory':
          reportData = await generateAssetInventoryReport(config);
          recordCount = reportData.length;
          totalValue = reportData.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
          break;
        
        case 'maintenance-summary':
          reportData = await generateMaintenanceSummaryReport(config);
          recordCount = reportData.length;
          totalValue = reportData.reduce((sum, req) => sum + (req.actualCost || 0), 0);
          break;
        
        case 'transfer-summary':
          reportData = await generateTransferSummaryReport(config);
          recordCount = reportData.length;
          totalValue = reportData.reduce((sum, transfer) => sum + (transfer.transferCost || 0), 0);
          break;
        
        case 'acquisition-summary':
          reportData = await generateAcquisitionSummaryReport(config);
          recordCount = reportData.length;
          totalValue = reportData.reduce((sum, req) => sum + (req.totalCost || 0), 0);
          break;
        
        default:
          throw new Error('Unsupported report type');
      }

      // Generate file based on format
      const fileName = `${config.type}_${Date.now()}.${config.format}`;
      const filePath = path.join('uploads', 'reports', fileName);
      
      // Ensure reports directory exists
      const reportsDir = path.join('uploads', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      let fileSize = 0;

      if (config.format === 'pdf') {
        fileSize = await generatePDFReport(reportData, config, filePath);
      } else if (config.format === 'csv') {
        fileSize = await generateCSVReport(reportData, config, filePath);
      }

      // Update report record
      report.filePath = filePath;
      report.fileSize = fileSize;
      report.status = 'completed';
      report.metadata = {
        recordCount,
        totalValue,
        dateGenerated: new Date(),
        processingTime: Date.now() - startTime
      };

      await report.save();

      res.json({
        message: 'Report generated successfully',
        report
      });
    } catch (generationError) {
      report.status = 'failed';
      await report.save();
      throw generationError;
    }
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reports/:id/download
// @desc    Download report file
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && 
        report.generatedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Increment download count
    report.downloadCount += 1;
    await report.save();

    const fileName = path.basename(report.filePath);
    res.download(report.filePath, fileName);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions for report generation
async function generateAssetInventoryReport(config) {
  const filter = {};
  if (config.filters.branch) filter.branch = config.filters.branch;
  if (config.filters.category) filter.category = config.filters.category;
  if (config.filters.status) filter.status = config.filters.status;

  return await Asset.find(filter)
    .populate('assignedTo', 'name email department')
    .lean();
}

async function generateMaintenanceSummaryReport(config) {
  const filter = {};
  
  // Date range filter
  if (config.dateRange !== 'custom') {
    const now = new Date();
    let startDate;
    
    switch (config.dateRange) {
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last-quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
    }
    
    if (startDate) filter.createdAt = { $gte: startDate };
  } else if (config.customStartDate && config.customEndDate) {
    filter.createdAt = {
      $gte: new Date(config.customStartDate),
      $lte: new Date(config.customEndDate)
    };
  }

  return await MaintenanceRequest.find(filter)
    .populate('asset', 'name serialNumber category')
    .populate('requestedBy', 'name email department')
    .populate('assignedTo', 'name email')
    .lean();
}

async function generateTransferSummaryReport(config) {
  const filter = {};
  
  // Apply date range and filters similar to maintenance report
  if (config.filters.status) filter.status = config.filters.status;
  if (config.filters.department) filter.department = config.filters.department;

  return await TransferRequest.find(filter)
    .populate('asset', 'name serialNumber category')
    .populate('requestedBy', 'name email department')
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .lean();
}

async function generateAcquisitionSummaryReport(config) {
  const filter = {};
  
  if (config.filters.status) filter.status = config.filters.status;
  if (config.filters.department) filter.department = config.filters.department;

  return await AcquisitionRequest.find(filter)
    .populate('requestedBy', 'name email department')
    .populate('approvedBy', 'name email')
    .lean();
}

async function generatePDFReport(data, config, filePath) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFillColor(51, 102, 204);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('AssetFlow Enterprise Report', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 50;

  // Report details
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(config.type.replace('-', ' ').toUpperCase(), 20, yPos);
  yPos += 15;

  // Generate table based on report type
  if (config.type === 'asset-inventory') {
    const tableData = data.slice(0, 50).map(asset => [
      asset.serialNumber || 'N/A',
      asset.name || 'N/A',
      asset.category || 'N/A',
      asset.status || 'N/A',
      asset.branch || 'N/A',
      `$${(asset.currentValue || 0).toLocaleString()}`
    ]);

    doc.autoTable({
      head: [['Serial Number', 'Name', 'Category', 'Status', 'Branch', 'Value']],
      body: tableData,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 102, 204] }
    });
  }

  // Save PDF
  doc.save(filePath);
  
  // Return file size
  const stats = fs.statSync(filePath);
  return stats.size;
}

async function generateCSVReport(data, config, filePath) {
  let csvData = [];

  switch (config.type) {
    case 'asset-inventory':
      csvData = data.map(asset => ({
        SerialNumber: asset.serialNumber || 'N/A',
        Name: asset.name || 'N/A',
        Category: asset.category || 'N/A',
        Status: asset.status || 'N/A',
        Branch: asset.branch || 'N/A',
        Location: asset.location || 'N/A',
        AssignedTo: asset.assignedTo?.name || 'Unassigned',
        PurchasePrice: asset.purchasePrice || 0,
        CurrentValue: asset.currentValue || 0,
        Condition: asset.condition || 'N/A',
        Vendor: asset.vendor || 'N/A',
        PurchaseDate: asset.purchaseDate || 'N/A'
      }));
      break;
    
    case 'maintenance-summary':
      csvData = data.map(request => ({
        RequestID: request._id,
        Title: request.title,
        AssetName: request.asset?.name || 'N/A',
        Priority: request.priority,
        Status: request.status,
        SubmittedDate: request.createdAt,
        CompletedDate: request.actualCompletion || 'N/A',
        Cost: request.actualCost || 0,
        RequestedBy: request.requestedBy?.name || 'N/A',
        AssignedTo: request.assignedTo?.name || 'Unassigned'
      }));
      break;
  }

  const csv = Papa.unparse(csvData);
  fs.writeFileSync(filePath, csv);
  
  const stats = fs.statSync(filePath);
  return stats.size;
}

module.exports = router;