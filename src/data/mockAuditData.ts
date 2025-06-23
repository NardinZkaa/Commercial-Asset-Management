import { AuditTask, ChecklistItem, MissingAsset, ScannedAsset } from '../types';

const generateChecklistItems = (type: string): ChecklistItem[] => {
  const baseItems: Record<string, ChecklistItem[]> = {
    'Compliance': [
      { id: '1', description: 'Review regulatory compliance documents', completed: true, required: true },
      { id: '2', description: 'Verify certification status', completed: true, required: true },
      { id: '3', description: 'Check policy adherence', completed: false, required: true },
      { id: '4', description: 'Validate training records', completed: false, required: false },
    ],
    'Security': [
      { id: '1', description: 'Scan for vulnerabilities', completed: true, required: true },
      { id: '2', description: 'Review access controls', completed: false, required: true },
      { id: '3', description: 'Check firewall configurations', completed: false, required: true },
      { id: '4', description: 'Validate encryption standards', completed: false, required: false },
    ],
    'IT Assets': [
      { id: '1', description: 'Inventory hardware components', completed: true, required: true },
      { id: '2', description: 'Verify software licenses', completed: false, required: true },
      { id: '3', description: 'Check maintenance schedules', completed: false, required: false },
      { id: '4', description: 'Update asset database', completed: false, required: true },
    ],
    'Financial': [
      { id: '1', description: 'Review financial statements', completed: true, required: true },
      { id: '2', description: 'Verify transaction records', completed: true, required: true },
      { id: '3', description: 'Check budget compliance', completed: false, required: true },
      { id: '4', description: 'Validate expense reports', completed: false, required: false },
    ],
    'Inventory': [
      { id: '1', description: 'Physical count verification', completed: false, required: true },
      { id: '2', description: 'Check storage conditions', completed: false, required: true },
      { id: '3', description: 'Update inventory system', completed: false, required: false },
      { id: '4', description: 'Verify supplier information', completed: false, required: false },
    ],
  };

  return baseItems[type] || [];
};

const generateMissingAssets = (): MissingAsset[] => [
  {
    id: '1',
    name: 'Dell Laptop - Model XPS 13',
    type: 'Hardware',
    expectedLocation: 'IT Department - Room 205',
    lastSeen: '2024-01-15',
    criticality: 'High'
  },
  {
    id: '2',
    name: 'Adobe Creative Suite License',
    type: 'Software',
    expectedLocation: 'Design Team License Pool',
    lastSeen: '2024-01-10',
    criticality: 'Medium'
  },
  {
    id: '3',
    name: 'Security Badge - Employee #1247',
    type: 'Access Control',
    expectedLocation: 'Security Office',
    criticality: 'High'
  },
  {
    id: '4',
    name: 'Cisco Router - Model ISR4331',
    type: 'Network Equipment',
    expectedLocation: 'Server Room A',
    lastSeen: '2024-01-08',
    criticality: 'Critical'
  }
];

const generateScannedAssets = (): ScannedAsset[] => [
  {
    id: 'scanned-1',
    qrCode: 'ASSET-001',
    name: 'Dell Laptop XPS 13',
    type: 'Hardware',
    location: 'IT Department - Room 205',
    scannedAt: '2024-01-25T09:15:00Z',
    status: 'verified'
  },
  {
    id: 'scanned-2',
    qrCode: 'ASSET-002',
    name: 'HP Printer LaserJet Pro',
    type: 'Hardware',
    location: 'Office Floor 2',
    scannedAt: '2024-01-25T09:30:00Z',
    status: 'verified'
  }
];

export const mockAuditTasks: AuditTask[] = [
  {
    id: '1',
    assetName: 'Server Infrastructure Audit',
    type: 'IT Assets',
    status: 'In Progress',
    priority: 'Critical',
    assignedTo: 'Sarah Johnson',
    dueDate: '2024-02-15',
    createdAt: '2024-01-20',
    notes: 'Comprehensive review of all server assets including hardware and software components.',
    checklist: generateChecklistItems('IT Assets'),
    missingAssets: generateMissingAssets().slice(0, 2),
    scannedAssets: generateScannedAssets(),
    scanResults: {
      id: 'scan-1',
      timestamp: '2024-01-25T10:30:00Z',
      totalAssets: 150,
      scannedAssets: 142,
      missingCount: 8,
      status: 'completed',
      duration: 1200
    }
  },
  {
    id: '2',
    assetName: 'Financial Records Q4 Review',
    type: 'Financial',
    status: 'Completed',
    priority: 'High',
    assignedTo: 'Michael Chen',
    dueDate: '2024-01-31',
    createdAt: '2024-01-15',
    notes: 'Year-end financial audit covering all transactions and compliance requirements.',
    checklist: generateChecklistItems('Financial'),
    missingAssets: [],
    scannedAssets: [],
    scanResults: {
      id: 'scan-2',
      timestamp: '2024-01-28T14:15:00Z',
      totalAssets: 89,
      scannedAssets: 89,
      missingCount: 0,
      status: 'completed',
      duration: 900
    }
  },
  {
    id: '3',
    assetName: 'Security Compliance Check',
    type: 'Security',
    status: 'Overdue',
    priority: 'Critical',
    assignedTo: 'Lisa Rodriguez',
    dueDate: '2024-01-20',
    createdAt: '2024-01-10',
    notes: 'Critical security assessment to ensure compliance with latest standards.',
    checklist: generateChecklistItems('Security'),
    missingAssets: generateMissingAssets().slice(2, 4),
    scannedAssets: [],
    scanResults: {
      id: 'scan-3',
      timestamp: '2024-01-22T09:45:00Z',
      totalAssets: 75,
      scannedAssets: 68,
      missingCount: 7,
      status: 'completed',
      duration: 1800
    }
  },
  {
    id: '4',
    assetName: 'Inventory Management System',
    type: 'Inventory',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'David Park',
    dueDate: '2024-02-28',
    createdAt: '2024-01-25',
    notes: 'Complete inventory audit of warehouse and storage facilities.',
    checklist: generateChecklistItems('Inventory'),
    missingAssets: generateMissingAssets().slice(1, 3),
    scannedAssets: [],
  },
  {
    id: '5',
    assetName: 'Regulatory Compliance Audit',
    type: 'Compliance',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Emily Watson',
    dueDate: '2024-02-20',
    createdAt: '2024-01-18',
    notes: 'Annual compliance review covering all regulatory requirements.',
    checklist: generateChecklistItems('Compliance'),
    missingAssets: [generateMissingAssets()[0]],
    scannedAssets: [],
    scanResults: {
      id: 'scan-5',
      timestamp: '2024-01-26T16:20:00Z',
      totalAssets: 120,
      scannedAssets: 115,
      missingCount: 5,
      status: 'in-progress',
      duration: 600
    }
  }
];

export const mockUsers = [
  'Sarah Johnson',
  'Michael Chen', 
  'Lisa Rodriguez',
  'David Park',
  'Emily Watson',
  'Alex Thompson',
  'Maria Garcia',
  'James Wilson'
];