import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Printer,
  Mail,
  Share2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { mockAssets, mockMaintenanceRequests, mockUsers } from '../data/mockMainData';
import MetricCard from '../components/MetricCard';

interface ReportConfig {
  type: 'asset-inventory' | 'maintenance-summary' | 'depreciation-analysis' | 'audit-compliance' | 'cost-analysis';
  format: 'pdf' | 'csv' | 'excel';
  dateRange: 'last-month' | 'last-quarter' | 'last-year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  filters: {
    branch?: string;
    category?: string;
    status?: string;
    department?: string;
  };
  includeCharts: boolean;
  includeDetails: boolean;
}

export default function Reports() {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'asset-inventory',
    format: 'pdf',
    dateRange: 'last-month',
    filters: {},
    includeCharts: true,
    includeDetails: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  const reportTypes = [
    { 
      id: 'asset-inventory', 
      name: 'Asset Inventory Report', 
      description: 'Complete asset listing with current status and values',
      icon: Package 
    },
    { 
      id: 'maintenance-summary', 
      name: 'Maintenance Summary', 
      description: 'Maintenance requests, costs, and performance metrics',
      icon: Settings 
    },
    { 
      id: 'depreciation-analysis', 
      name: 'Depreciation Analysis', 
      description: 'Asset value trends and depreciation calculations',
      icon: TrendingUp 
    },
    { 
      id: 'audit-compliance', 
      name: 'Audit & Compliance', 
      description: 'Compliance status and audit trail reports',
      icon: CheckCircle 
    },
    { 
      id: 'cost-analysis', 
      name: 'Cost Analysis', 
      description: 'Financial analysis and cost optimization insights',
      icon: DollarSign 
    }
  ];

  const handleConfigChange = (field: keyof ReportConfig, value: any) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setReportConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterKey]: value }
    }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const reportData = {
      id: `RPT-${Date.now()}`,
      type: reportConfig.type,
      format: reportConfig.format,
      generatedAt: new Date().toISOString(),
      config: reportConfig
    };

    if (reportConfig.format === 'pdf') {
      generatePDFReport(reportData);
    } else if (reportConfig.format === 'csv') {
      generateCSVReport(reportData);
    }

    setGeneratedReports(prev => [reportData, ...prev]);
    setIsGenerating(false);
  };

  const generatePDFReport = (reportData: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFillColor(51, 102, 204);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('AssetFlow Enterprise Report', pageWidth / 2, 25, { align: 'center' });
    
    // Report metadata
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Report ID: ${reportData.id}`, pageWidth - 20, 35, { align: 'right' });
    
    yPos = 55;

    // Report Title
    const reportType = reportTypes.find(r => r.id === reportConfig.type);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(reportType?.name || 'Report', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 15;

    // Report summary
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date Range: ${reportConfig.dateRange}`, 20, yPos);
    doc.text(`Filters Applied: ${Object.keys(reportConfig.filters).length} filters`, 20, yPos + 7);
    yPos += 20;

    // Report Content based on type
    if (reportConfig.type === 'asset-inventory') {
      generateAssetInventoryPDF(doc, yPos, pageHeight);
    } else if (reportConfig.type === 'maintenance-summary') {
      generateMaintenanceSummaryPDF(doc, yPos, pageHeight);
    } else if (reportConfig.type === 'depreciation-analysis') {
      generateDepreciationAnalysisPDF(doc, yPos, pageHeight);
    } else if (reportConfig.type === 'audit-compliance') {
      generateAuditCompliancePDF(doc, yPos, pageHeight);
    } else if (reportConfig.type === 'cost-analysis') {
      generateCostAnalysisPDF(doc, yPos, pageHeight);
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('AssetFlow Enterprise - Confidential', pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    doc.save(`${reportType?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateAssetInventoryPDF = (doc: jsPDF, startY: number, pageHeight: number) => {
    const assets = mockAssets.filter(asset => {
      if (reportConfig.filters.category && asset.category !== reportConfig.filters.category) return false;
      if (reportConfig.filters.status && asset.status !== reportConfig.filters.status) return false;
      if (reportConfig.filters.branch && asset.branch !== reportConfig.filters.branch) return false;
      return true;
    });

    let yPos = startY;

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const avgValue = totalValue / assets.length;
    
    doc.setFontSize(10);
    doc.text(`Total Assets: ${assets.length}`, 20, yPos);
    doc.text(`Total Value: $${totalValue.toLocaleString()}`, 20, yPos + 7);
    doc.text(`Average Value: $${avgValue.toLocaleString()}`, 20, yPos + 14);
    doc.text(`Active Assets: ${assets.filter(a => a.status === 'Active').length}`, 20, yPos + 21);
    yPos += 35;

    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    // Asset details table
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Asset Details', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 15;

    const tableData = assets.map(asset => [
      asset.id,
      asset.name,
      asset.category,
      asset.status,
      asset.branch,
      asset.location,
      `$${asset.currentValue.toLocaleString()}`,
      asset.condition,
      asset.assignedTo || 'Unassigned'
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Name', 'Category', 'Status', 'Branch', 'Location', 'Value', 'Condition', 'Assigned To']],
      body: tableData,
      startY: yPos,
      styles: { 
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [51, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 }
    });
  };

  const generateMaintenanceSummaryPDF = (doc: jsPDF, startY: number, pageHeight: number) => {
    const requests = mockMaintenanceRequests.filter(request => {
      const requestDate = new Date(request.submittedDate);
      const now = new Date();
      
      if (reportConfig.dateRange === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return requestDate >= lastMonth;
      } else if (reportConfig.dateRange === 'last-quarter') {
        const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return requestDate >= lastQuarter;
      } else if (reportConfig.dateRange === 'last-year') {
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        return requestDate >= lastYear;
      }
      return true;
    });

    let yPos = startY;

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Maintenance Summary', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const totalCost = requests.reduce((sum, req) => sum + (req.cost || 0), 0);
    const avgCost = totalCost / requests.length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    
    doc.setFontSize(10);
    doc.text(`Total Requests: ${requests.length}`, 20, yPos);
    doc.text(`Completed: ${completedRequests}`, 20, yPos + 7);
    doc.text(`Total Cost: $${totalCost.toLocaleString()}`, 20, yPos + 14);
    doc.text(`Average Cost: $${avgCost.toLocaleString()}`, 20, yPos + 21);
    yPos += 35;

    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    // Maintenance details table
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Maintenance Details', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 15;

    const tableData = requests.map(request => [
      request.id,
      request.title,
      request.priority,
      request.status,
      request.category,
      new Date(request.submittedDate).toLocaleDateString(),
      request.cost ? `$${request.cost}` : 'TBD',
      request.assignedTo ? 'Assigned' : 'Unassigned'
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Title', 'Priority', 'Status', 'Category', 'Submitted', 'Cost', 'Assignment']],
      body: tableData,
      startY: yPos,
      styles: { 
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [51, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 }
    });
  };

  const generateDepreciationAnalysisPDF = (doc: jsPDF, startY: number, pageHeight: number) => {
    let yPos = startY;

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Depreciation Analysis', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const totalPurchaseValue = mockAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
    const totalCurrentValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDepreciation = totalPurchaseValue - totalCurrentValue;
    const depreciationRate = (totalDepreciation / totalPurchaseValue) * 100;
    
    doc.setFontSize(10);
    doc.text(`Total Purchase Value: $${totalPurchaseValue.toLocaleString()}`, 20, yPos);
    doc.text(`Current Value: $${totalCurrentValue.toLocaleString()}`, 20, yPos + 7);
    doc.text(`Total Depreciation: $${totalDepreciation.toLocaleString()}`, 20, yPos + 14);
    doc.text(`Depreciation Rate: ${depreciationRate.toFixed(2)}%`, 20, yPos + 21);
    yPos += 35;

    // Category breakdown
    const categoryData = mockAssets.reduce((acc: any, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = { purchase: 0, current: 0, count: 0 };
      }
      acc[asset.category].purchase += asset.purchasePrice;
      acc[asset.category].current += asset.currentValue;
      acc[asset.category].count += 1;
      return acc;
    }, {});

    const tableData = Object.entries(categoryData).map(([category, data]: [string, any]) => [
      category,
      data.count.toString(),
      `$${data.purchase.toLocaleString()}`,
      `$${data.current.toLocaleString()}`,
      `$${(data.purchase - data.current).toLocaleString()}`,
      `${(((data.purchase - data.current) / data.purchase) * 100).toFixed(2)}%`
    ]);

    (doc as any).autoTable({
      head: [['Category', 'Count', 'Purchase Value', 'Current Value', 'Depreciation', 'Rate']],
      body: tableData,
      startY: yPos,
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [51, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 }
    });
  };

  const generateAuditCompliancePDF = (doc: jsPDF, startY: number, pageHeight: number) => {
    let yPos = startY;

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Audit & Compliance Report', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const totalAssets = mockAssets.length;
    const auditedAssets = mockAssets.filter(a => a.lastAuditDate).length;
    const overdueAudits = mockAssets.filter(a => {
      if (!a.nextAuditDate) return false;
      return new Date(a.nextAuditDate) < new Date();
    }).length;
    const complianceRate = ((auditedAssets / totalAssets) * 100);
    
    doc.setFontSize(10);
    doc.text(`Total Assets: ${totalAssets}`, 20, yPos);
    doc.text(`Audited Assets: ${auditedAssets}`, 20, yPos + 7);
    doc.text(`Overdue Audits: ${overdueAudits}`, 20, yPos + 14);
    doc.text(`Compliance Rate: ${complianceRate.toFixed(2)}%`, 20, yPos + 21);
    yPos += 35;

    // Audit status table
    const auditData = mockAssets.map(asset => [
      asset.id,
      asset.name,
      asset.lastAuditDate ? new Date(asset.lastAuditDate).toLocaleDateString() : 'Never',
      asset.nextAuditDate ? new Date(asset.nextAuditDate).toLocaleDateString() : 'Not scheduled',
      asset.nextAuditDate && new Date(asset.nextAuditDate) < new Date() ? 'Overdue' : 'Current',
      asset.condition
    ]);

    (doc as any).autoTable({
      head: [['Asset ID', 'Name', 'Last Audit', 'Next Audit', 'Status', 'Condition']],
      body: auditData,
      startY: yPos,
      styles: { 
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [51, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 }
    });
  };

  const generateCostAnalysisPDF = (doc: jsPDF, startY: number, pageHeight: number) => {
    let yPos = startY;

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Cost Analysis Report', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;

    const totalMaintenanceCost = mockMaintenanceRequests
      .filter(r => r.status === 'completed' && r.cost)
      .reduce((sum, r) => sum + (r.cost || 0), 0);
    
    const avgMaintenanceCost = totalMaintenanceCost / mockMaintenanceRequests.filter(r => r.cost).length;
    const totalAssetValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const maintenanceRatio = (totalMaintenanceCost / totalAssetValue) * 100;
    
    doc.setFontSize(10);
    doc.text(`Total Asset Value: $${totalAssetValue.toLocaleString()}`, 20, yPos);
    doc.text(`Total Maintenance Cost: $${totalMaintenanceCost.toLocaleString()}`, 20, yPos + 7);
    doc.text(`Average Maintenance Cost: $${avgMaintenanceCost.toLocaleString()}`, 20, yPos + 14);
    doc.text(`Maintenance to Asset Ratio: ${maintenanceRatio.toFixed(2)}%`, 20, yPos + 21);
    yPos += 35;

    // Cost breakdown by category
    const costByCategory = mockMaintenanceRequests.reduce((acc: any, request) => {
      if (!request.cost) return acc;
      if (!acc[request.category]) {
        acc[request.category] = { total: 0, count: 0 };
      }
      acc[request.category].total += request.cost;
      acc[request.category].count += 1;
      return acc;
    }, {});

    const costTableData = Object.entries(costByCategory).map(([category, data]: [string, any]) => [
      category,
      data.count.toString(),
      `$${data.total.toLocaleString()}`,
      `$${(data.total / data.count).toLocaleString()}`,
      `${((data.total / totalMaintenanceCost) * 100).toFixed(2)}%`
    ]);

    (doc as any).autoTable({
      head: [['Category', 'Requests', 'Total Cost', 'Avg Cost', '% of Total']],
      body: costTableData,
      startY: yPos,
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [51, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 }
    });
  };

  const generateCSVReport = (reportData: any) => {
    let csvData: any[] = [];

    if (reportConfig.type === 'asset-inventory') {
      csvData = mockAssets.map(asset => ({
        ID: asset.id,
        Name: asset.name,
        Category: asset.category,
        Status: asset.status,
        Branch: asset.branch,
        SerialNumber: asset.serialNumber,
        Location: asset.location,
        PurchasePrice: asset.purchasePrice,
        CurrentValue: asset.currentValue,
        Condition: asset.condition,
        Vendor: asset.vendor,
        PurchaseDate: asset.purchaseDate,
        Warranty: asset.warranty || 'N/A'
      }));
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportConfig.type}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Report Generation</h1>
              <p className="text-indigo-200 text-lg">Generate comprehensive reports and analytics</p>
              <div className="flex items-center space-x-6 mt-3 text-sm text-indigo-100">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Multiple Formats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Reports"
          value={generatedReports.length}
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="This Month"
          value={generatedReports.filter(r => 
            new Date(r.generatedAt).getMonth() === new Date().getMonth()
          ).length}
          icon={Calendar}
          color="green"
        />
        <MetricCard
          title="Scheduled"
          value="12"
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Automated"
          value="8"
          icon={Settings}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Report Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {reportTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      reportConfig.type === type.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                    onClick={() => handleConfigChange('type', type.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportConfig.type === type.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{type.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Format and Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Output Format</label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => handleConfigChange('format', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="excel">Excel Workbook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                <select
                  value={reportConfig.dateRange}
                  onChange={(e) => handleConfigChange('dateRange', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="last-month">Last Month</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="last-year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {reportConfig.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={reportConfig.customStartDate || ''}
                    onChange={(e) => handleConfigChange('customStartDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={reportConfig.customEndDate || ''}
                    onChange={(e) => handleConfigChange('customEndDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                  <select
                    value={reportConfig.filters.branch || ''}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Branches</option>
                    <option value="New York">New York</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Austin">Austin</option>
                    <option value="Seattle">Seattle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={reportConfig.filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={reportConfig.filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select
                    value={reportConfig.filters.department || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Report Options */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">Report Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Include Charts and Visualizations</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeDetails}
                    onChange={(e) => handleConfigChange('includeDetails', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Include Detailed Asset Information</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8">
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report History */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Reports</h2>
            
            {generatedReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No reports generated yet</p>
                <p className="text-sm text-slate-500 mt-1">Configure and generate your first report</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedReports.slice(0, 10).map((report) => {
                  const reportType = reportTypes.find(r => r.id === report.type);
                  return (
                    <div key={report.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{reportType?.name}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(report.generatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full uppercase">
                          {report.format}
                        </span>
                        <button className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors duration-200">
                <Printer className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-slate-900">Schedule Monthly Report</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors duration-200">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-slate-900">Email Report</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors duration-200">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-slate-900">Share Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}