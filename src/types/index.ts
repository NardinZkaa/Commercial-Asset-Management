export interface Asset {
  id: string;
  name: string;
  category: 'Electronics' | 'Furniture' | 'Vehicles' | 'Equipment' | 'Laptop' | 'Monitor' | 'Mobile' | 'Tablet' | 'Desktop';
  status: 'Active' | 'Inactive' | 'Under Maintenance' | 'Retired';
  branch: 'Main Branch' | 'North Branch' | 'East Branch' | 'New York' | 'San Francisco' | 'Austin' | 'Seattle';
  assignedTo?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  serialNumber: string;
  location: string;
  lastAuditDate?: string;
  nextAuditDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  warranty?: string;
  warrantyExpiry?: string;
  vendor: string;
  description: string;
}

export interface AuditTask {
  id: string;
  assetName: string;
  type: 'Compliance' | 'Security' | 'Financial' | 'IT Assets' | 'Inventory';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  notes?: string;
  checklist: ChecklistItem[];
  missingAssets: MissingAsset[];
  scannedAssets: ScannedAsset[];
  scanResults?: ScanResult;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface MissingAsset {
  id: string;
  name: string;
  type: string;
  expectedLocation: string;
  lastSeen?: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface ScannedAsset {
  id: string;
  qrCode: string;
  name: string;
  type: string;
  location: string;
  scannedAt: string;
  status: 'verified' | 'unexpected' | 'damaged';
}

export interface ScanResult {
  id: string;
  timestamp: string;
  totalAssets: number;
  scannedAssets: number;
  missingCount: number;
  status: 'completed' | 'in-progress' | 'failed';
  duration: number;
}

export interface CreateTaskForm {
  assetName: string;
  type: AuditTask['type'];
  priority: AuditTask['priority'];
  assignedTo: string;
  dueDate: string;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'Admin' | 'Manager' | 'Employee';
  branch: string;
  assignedAssets?: string[];
  avatar?: string;
}

export interface DashboardMetrics {
  totalAssets: number;
  activeAssets: number;
  totalValue: number;
  pendingAudits: number;
  overdueAudits: number;
  maintenanceRequired: number;
  utilizationRate: number;
  complianceScore: number;
  monthlyMaintenanceCost: number;
  avgMaintenanceCost: number;
  totalMaintenanceCost: number;
}

export interface FilterType {
  category: string;
  status: string;
  branch: string;
  assignedTo: string;
  dateRange: string;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'hardware' | 'software' | 'network' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  submittedDate: string;
  assignedTo?: string;
  assignedType?: 'helpdesk' | 'vendor';
  estimatedCompletion?: string;
  actualCompletion?: string;
  notes?: string;
  attachments?: MaintenanceAttachment[];
  warrantyEligible?: boolean;
  warrantyUsed?: boolean;
  cost?: number;
  estimatedCost?: number;
  laborCost?: number;
  partsCost?: number;
  resolution?: string;
  timeSpent?: number; // in hours
  approvedBy?: string;
  approvedDate?: string;
}

export interface MaintenanceAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
}

export interface HelpDeskEmployee {
  id: string;
  name: string;
  email: string;
  specialization: string[];
  workload: number;
  available: boolean;
  hourlyRate?: number;
  totalTicketsCompleted?: number;
  avgResolutionTime?: number; // in hours
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  rating: number;
  responseTime: string;
  hourlyRate?: number;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  userId: string;
  assignedDate: string;
  status: 'pending' | 'signed' | 'returned';
}

export interface HandoverForm {
  id: string;
  assetId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  signed: boolean;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromUserId?: string;
  toUserId?: string;
  fromBranch?: string;
  toBranch?: string;
  transferType: 'user' | 'branch' | 'location';
  reason: string;
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  completedDate?: string;
  status: 'pending' | 'approved' | 'in-transit' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  transferCost?: number;
  requiresApproval: boolean;
}

export interface ReportConfig {
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

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AcquisitionRequest {
  id: string;
  requestedBy: string;
  department: string;
  branch: string;
  requestDate: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'ordered' | 'delivered' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  justification: string;
  businessCase: string;
  items: AcquisitionItem[];
  totalCost: number;
  budgetCode?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  vendorQuotes: VendorQuote[];
  selectedVendor?: string;
  poNumber?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
}

export interface AcquisitionItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: string;
  urgency: 'immediate' | 'within-month' | 'within-quarter' | 'flexible';
  vendor?: string;
  model?: string;
  warranty?: string;
}

export interface VendorQuote {
  id: string;
  vendorName: string;
  vendorEmail: string;
  quotedPrice: number;
  deliveryTime: string;
  warranty: string;
  notes?: string;
  quoteDate: string;
  validUntil: string;
  selected: boolean;
}

export interface BudgetAllocation {
  department: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  pendingRequests: number;
}

export interface ProcurementVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string[];
  rating: number;
  responseTime: string;
  hourlyRate?: number;
  contractStatus: 'active' | 'pending' | 'expired' | 'terminated';
  contractExpiry?: string;
  totalOrders: number;
  totalValue: number;
  avgDeliveryTime: number;
  qualityScore: number;
  onTimeDelivery: number;
  certifications: string[];
  paymentTerms: string;
  notes?: string;
}