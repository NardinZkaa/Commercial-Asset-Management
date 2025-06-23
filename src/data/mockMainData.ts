import { User, Asset, MaintenanceRequest, HelpDeskEmployee, Vendor } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    role: 'Manager',
    branch: 'New York'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'Marketing',
    role: 'Employee',
    branch: 'San Francisco'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    department: 'Design',
    role: 'Employee',
    branch: 'Austin'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@company.com',
    department: 'Engineering',
    role: 'Employee',
    branch: 'Seattle'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    department: 'HR',
    role: 'Admin',
    branch: 'New York'
  }
];

export const mockAssets: Asset[] = [
  {
    id: 'AST-001',
    name: 'MacBook Pro 16"',
    category: 'Laptop',
    status: 'Active',
    serialNumber: 'MBP001',
    location: 'Office Floor 3',
    branch: 'New York',
    purchaseDate: '2023-01-15',
    purchasePrice: 2499,
    currentValue: 2000,
    condition: 'Excellent',
    vendor: 'Apple Inc.',
    warranty: '3 years',
    warrantyExpiry: '2026-01-15',
    description: 'High-performance laptop for development work',
    nextAuditDate: '2024-01-15',
    assignedTo: 'Sarah Johnson'
  },
  {
    id: 'AST-002',
    name: 'Dell Monitor 27"',
    category: 'Monitor',
    status: 'Active',
    serialNumber: 'DM002',
    location: 'Office Floor 2',
    branch: 'San Francisco',
    purchaseDate: '2023-02-20',
    purchasePrice: 450,
    currentValue: 350,
    condition: 'Good',
    vendor: 'Dell Technologies',
    warranty: '2 years',
    warrantyExpiry: '2025-02-20',
    description: '4K display monitor for design work',
    nextAuditDate: '2024-02-20'
  },
  {
    id: 'AST-003',
    name: 'iPhone 14 Pro',
    category: 'Mobile',
    status: 'Active',
    serialNumber: 'IP003',
    location: 'Mobile Assets',
    branch: 'Austin',
    purchaseDate: '2023-03-10',
    purchasePrice: 999,
    currentValue: 750,
    condition: 'Excellent',
    vendor: 'Apple Inc.',
    warranty: '1 year',
    warrantyExpiry: '2024-03-10',
    description: 'Company mobile device',
    nextAuditDate: '2024-03-10',
    assignedTo: 'Michael Chen'
  },
  {
    id: 'AST-004',
    name: 'Surface Pro 9',
    category: 'Tablet',
    status: 'Active',
    serialNumber: 'SP004',
    location: 'Office Floor 1',
    branch: 'Seattle',
    purchaseDate: '2023-04-05',
    purchasePrice: 1299,
    currentValue: 1000,
    condition: 'Good',
    vendor: 'Microsoft',
    warranty: '2 years',
    warrantyExpiry: '2025-04-05',
    description: 'Portable tablet for presentations',
    nextAuditDate: '2024-04-05'
  },
  {
    id: 'AST-005',
    name: 'ThinkPad X1 Carbon',
    category: 'Laptop',
    status: 'Active',
    serialNumber: 'TP005',
    location: 'Office Floor 4',
    branch: 'New York',
    purchaseDate: '2023-05-12',
    purchasePrice: 1899,
    currentValue: 1500,
    condition: 'Excellent',
    vendor: 'Lenovo',
    warranty: '3 years',
    warrantyExpiry: '2026-05-12',
    description: 'Lightweight business laptop',
    nextAuditDate: '2024-05-12'
  }
];

export const mockHelpDeskEmployees: HelpDeskEmployee[] = [
  {
    id: 'HD-001',
    name: 'Alex Martinez',
    email: 'alex.martinez@company.com',
    specialization: ['Hardware', 'Network'],
    workload: 3,
    available: true,
    hourlyRate: 45,
    totalTicketsCompleted: 127,
    avgResolutionTime: 4.2
  },
  {
    id: 'HD-002',
    name: 'Jessica Wong',
    email: 'jessica.wong@company.com',
    specialization: ['Software', 'Hardware'],
    workload: 5,
    available: true,
    hourlyRate: 50,
    totalTicketsCompleted: 203,
    avgResolutionTime: 3.8
  },
  {
    id: 'HD-003',
    name: 'Robert Kim',
    email: 'robert.kim@company.com',
    specialization: ['Network', 'Security'],
    workload: 2,
    available: true,
    hourlyRate: 55,
    totalTicketsCompleted: 89,
    avgResolutionTime: 5.1
  },
  {
    id: 'HD-004',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    specialization: ['Software', 'Mobile'],
    workload: 4,
    available: false,
    hourlyRate: 48,
    totalTicketsCompleted: 156,
    avgResolutionTime: 3.5
  }
];

export const mockVendors: Vendor[] = [
  {
    id: 'VND-001',
    name: 'TechFix Solutions',
    email: 'support@techfix.com',
    phone: '+1-555-0123',
    specialization: ['Hardware', 'Laptop Repair'],
    rating: 4.8,
    responseTime: '2-4 hours',
    hourlyRate: 85
  },
  {
    id: 'VND-002',
    name: 'Apple Authorized Service',
    email: 'service@appleauth.com',
    phone: '+1-555-0456',
    specialization: ['Apple Products', 'Mobile'],
    rating: 4.9,
    responseTime: '1-2 hours',
    hourlyRate: 120
  },
  {
    id: 'VND-003',
    name: 'Network Pro Services',
    email: 'help@networkpro.com',
    phone: '+1-555-0789',
    specialization: ['Network', 'Infrastructure'],
    rating: 4.6,
    responseTime: '4-6 hours',
    hourlyRate: 95
  },
  {
    id: 'VND-004',
    name: 'Software Solutions Inc',
    email: 'support@softwaresol.com',
    phone: '+1-555-0321',
    specialization: ['Software', 'System Integration'],
    rating: 4.7,
    responseTime: '1-3 hours',
    hourlyRate: 75
  }
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'MR-001',
    assetId: 'AST-001',
    userId: '1',
    title: 'Screen flickering issue',
    description: 'The laptop screen has been flickering intermittently, especially when running graphics-intensive applications. This is affecting productivity during video calls and design work.',
    priority: 'high',
    category: 'hardware',
    status: 'in-progress',
    submittedDate: '2024-01-15T10:30:00Z',
    assignedTo: 'HD-001',
    assignedType: 'helpdesk',
    estimatedCompletion: '2024-01-18T17:00:00Z',
    notes: 'Diagnosed as potential GPU issue. Replacement parts ordered.',
    warrantyEligible: true,
    warrantyUsed: false,
    estimatedCost: 350,
    laborCost: 135,
    partsCost: 215,
    timeSpent: 3,
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-01-15T14:00:00Z'
  },
  {
    id: 'MR-002',
    assetId: 'AST-002',
    userId: '2',
    title: 'Monitor not displaying colors correctly',
    description: 'The monitor is showing washed out colors and poor contrast. Color calibration attempts have not resolved the issue.',
    priority: 'medium',
    category: 'hardware',
    status: 'pending',
    submittedDate: '2024-01-16T14:20:00Z',
    warrantyEligible: true,
    warrantyUsed: false,
    estimatedCost: 200
  },
  {
    id: 'MR-003',
    assetId: 'AST-003',
    userId: '2',
    title: 'Battery draining quickly',
    description: 'iPhone battery is draining much faster than normal, lasting only 3-4 hours with minimal usage.',
    priority: 'medium',
    category: 'hardware',
    status: 'completed',
    submittedDate: '2024-01-10T09:15:00Z',
    assignedTo: 'VND-002',
    assignedType: 'vendor',
    actualCompletion: '2024-01-12T16:30:00Z',
    notes: 'Battery replaced under warranty. Issue resolved.',
    resolution: 'Replaced battery under Apple warranty. Device tested and working normally.',
    warrantyEligible: true,
    warrantyUsed: true,
    cost: 0,
    laborCost: 0,
    partsCost: 0,
    timeSpent: 1.5,
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-01-10T11:00:00Z'
  },
  {
    id: 'MR-004',
    assetId: 'AST-004',
    userId: '4',
    title: 'Software installation request',
    description: 'Need Adobe Creative Suite installed for upcoming design projects. Current license allows for additional installation.',
    priority: 'low',
    category: 'software',
    status: 'pending',
    submittedDate: '2024-01-17T11:45:00Z',
    warrantyEligible: false,
    estimatedCost: 50,
    laborCost: 50,
    partsCost: 0
  },
  {
    id: 'MR-005',
    assetId: 'AST-005',
    userId: '3',
    title: 'Keyboard keys not responding',
    description: 'Several keys on the laptop keyboard are not responding properly. Affects typing efficiency significantly.',
    priority: 'high',
    category: 'hardware',
    status: 'completed',
    submittedDate: '2024-01-08T08:30:00Z',
    assignedTo: 'HD-002',
    assignedType: 'helpdesk',
    actualCompletion: '2024-01-10T15:00:00Z',
    notes: 'Keyboard replacement completed successfully.',
    resolution: 'Replaced faulty keyboard. All keys now functioning properly.',
    warrantyEligible: true,
    warrantyUsed: true,
    cost: 120,
    laborCost: 90,
    partsCost: 30,
    timeSpent: 2,
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-01-08T10:00:00Z'
  }
];