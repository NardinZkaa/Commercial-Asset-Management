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