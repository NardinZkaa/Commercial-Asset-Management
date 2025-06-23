import { Asset, User, AuditTask, DashboardMetrics } from '../types';

export const mockAssets: Asset[] = [
  {
    id: 'AST-001',
    name: 'Dell Laptop XPS 13',
    category: 'Electronics',
    status: 'Active',
    branch: 'Main Branch',
    assignedTo: 'John Smith',
    purchaseDate: '2023-01-15',
    purchasePrice: 1200,
    currentValue: 800,
    serialNumber: 'DL123456789',
    location: 'Office 201',
    lastAuditDate: '2024-01-15',
    nextAuditDate: '2024-07-15',
    condition: 'Good',
    warranty: '2025-01-15',
    vendor: 'Dell Technologies',
    description: 'High-performance laptop for development work'
  },
  {
    id: 'AST-002',
    name: 'Herman Miller Chair',
    category: 'Furniture',
    status: 'Active',
    branch: 'Main Branch',
    assignedTo: 'Sarah Johnson',
    purchaseDate: '2022-06-10',
    purchasePrice: 800,
    currentValue: 600,
    serialNumber: 'HM987654321',
    location: 'Office 205',
    lastAuditDate: '2024-01-10',
    nextAuditDate: '2024-07-10',
    condition: 'Excellent',
    vendor: 'Herman Miller',
    description: 'Ergonomic office chair with lumbar support'
  },
  {
    id: 'AST-003',
    name: 'Toyota Camry 2023',
    category: 'Vehicles',
    status: 'Under Maintenance',
    branch: 'North Branch',
    purchaseDate: '2023-03-20',
    purchasePrice: 28000,
    currentValue: 25000,
    serialNumber: 'TC2023456789',
    location: 'Parking Lot A',
    lastAuditDate: '2024-01-20',
    nextAuditDate: '2024-04-20',
    condition: 'Good',
    warranty: '2026-03-20',
    vendor: 'Toyota Motors',
    description: 'Company vehicle for business travel'
  },
  {
    id: 'AST-004',
    name: 'Conference Table',
    category: 'Furniture',
    status: 'Active',
    branch: 'East Branch',
    purchaseDate: '2022-11-05',
    purchasePrice: 1500,
    currentValue: 1200,
    serialNumber: 'CT789123456',
    location: 'Conference Room B',
    lastAuditDate: '2024-01-05',
    nextAuditDate: '2024-07-05',
    condition: 'Good',
    vendor: 'Office Furniture Co.',
    description: '12-person conference table with cable management'
  },
  {
    id: 'AST-005',
    name: 'MacBook Pro 16"',
    category: 'Electronics',
    status: 'Active',
    branch: 'Main Branch',
    assignedTo: 'Mike Chen',
    purchaseDate: '2023-08-12',
    purchasePrice: 2500,
    currentValue: 2000,
    serialNumber: 'MB789456123',
    location: 'Office 301',
    lastAuditDate: '2024-02-12',
    nextAuditDate: '2024-08-12',
    condition: 'Excellent',
    warranty: '2026-08-12',
    vendor: 'Apple Inc.',
    description: 'High-end laptop for design and development'
  }
];

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    role: 'Employee',
    branch: 'Main Branch',
    assignedAssets: ['AST-001']
  },
  {
    id: 'USR-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Marketing',
    role: 'Manager',
    branch: 'Main Branch',
    assignedAssets: ['AST-002']
  },
  {
    id: 'USR-003',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'Design',
    role: 'Employee',
    branch: 'Main Branch',
    assignedAssets: ['AST-005']
  },
  {
    id: 'USR-004',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    department: 'HR',
    role: 'Admin',
    branch: 'North Branch',
    assignedAssets: []
  }
];

export const mockAuditTasks: AuditTask[] = [
  {
    id: 'AUD-001',
    assetName: 'Dell Laptop XPS 13',
    assignedTo: 'Emily Davis',
    dueDate: '2024-07-15',
    status: 'Pending',
    priority: 'Medium',
    type: 'IT Assets',
    notes: 'Regular 6-month audit check',
    createdAt: '2024-01-15T10:00:00Z',
    checklist: [],
    missingAssets: [],
    scannedAssets: []
  },
  {
    id: 'AUD-002',
    assetName: 'Toyota Camry 2023',
    assignedTo: 'Emily Davis',
    dueDate: '2024-04-20',
    status: 'Overdue',
    priority: 'High',
    type: 'IT Assets',
    notes: 'Vehicle maintenance inspection required',
    createdAt: '2024-01-20T10:00:00Z',
    checklist: [],
    missingAssets: [],
    scannedAssets: []
  },
  {
    id: 'AUD-003',
    assetName: 'MacBook Pro 16"',
    assignedTo: 'Sarah Johnson',
    dueDate: '2024-08-12',
    status: 'In Progress',
    priority: 'Low',
    type: 'IT Assets',
    notes: 'Verify asset location and condition',
    createdAt: '2024-02-12T10:00:00Z',
    checklist: [],
    missingAssets: [],
    scannedAssets: []
  }
];

export const mockMetrics: DashboardMetrics = {
  totalAssets: 156,
  activeAssets: 142,
  totalValue: 2450000,
  pendingAudits: 23,
  overdueAudits: 5,
  maintenanceRequired: 8,
  utilizationRate: 87,
  complianceScore: 94,
  monthlyMaintenanceCost: 12500,
  avgMaintenanceCost: 285,
  totalMaintenanceCost: 45600
};