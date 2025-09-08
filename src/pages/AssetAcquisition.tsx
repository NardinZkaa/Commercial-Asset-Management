import { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CheckCircle, 
  X, 
  Clock, 
  User, 
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Send,
  Building,
  Truck,
  ClipboardCheck,
  UserCheck,
  Star,
  TrendingUp,
  Calculator,
  CreditCard,
  Banknote,
  Receipt,
  ShoppingBag
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { mockUsers } from '../data/mockMainData';
import { User as UserType } from '../types';
import MetricCard from '../components/MetricCard';

interface AcquisitionRequest {
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

interface AcquisitionItem {
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

interface VendorQuote {
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

interface BudgetAllocation {
  department: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  pendingRequests: number;
}

export default function AssetAcquisition() {
  const [users] = useState<UserType[]>(mockUsers);
  const [requests, setRequests] = useState<AcquisitionRequest[]>([
    {
      id: 'ACQ-001',
      requestedBy: '1',
      department: 'Engineering',
      branch: 'New York',
      requestDate: '2024-01-20T10:00:00Z',
      status: 'approved',
      priority: 'high',
      justification: 'Current laptops are outdated and affecting development productivity',
      businessCase: 'Upgrading to newer hardware will improve development speed by 30% and reduce downtime',
      items: [
        {
          id: 'item-1',
          name: 'MacBook Pro 16" M3',
          category: 'Laptop',
          description: 'High-performance laptop for software development',
          quantity: 3,
          unitPrice: 2499,
          totalPrice: 7497,
          specifications: '16GB RAM, 512GB SSD, M3 Pro chip',
          urgency: 'within-month',
          vendor: 'Apple Inc.',
          model: 'MBP16-M3-2024',
          warranty: '3 years AppleCare+'
        }
      ],
      totalCost: 7497,
      budgetCode: 'ENG-2024-Q1',
      approvedBy: '5',
      approvedDate: '2024-01-22T14:30:00Z',
      vendorQuotes: [
        {
          id: 'quote-1',
          vendorName: 'Apple Inc.',
          vendorEmail: 'enterprise@apple.com',
          quotedPrice: 7497,
          deliveryTime: '5-7 business days',
          warranty: '3 years AppleCare+',
          quoteDate: '2024-01-21T09:00:00Z',
          validUntil: '2024-02-21T09:00:00Z',
          selected: true
        },
        {
          id: 'quote-2',
          vendorName: 'TechSource Pro',
          vendorEmail: 'sales@techsource.com',
          quotedPrice: 7200,
          deliveryTime: '7-10 business days',
          warranty: '2 years standard',
          quoteDate: '2024-01-21T11:30:00Z',
          validUntil: '2024-02-21T11:30:00Z',
          selected: false
        }
      ],
      selectedVendor: 'Apple Inc.',
      poNumber: 'PO-2024-001',
      expectedDelivery: '2024-01-30T17:00:00Z'
    },
    {
      id: 'ACQ-002',
      requestedBy: '2',
      department: 'Marketing',
      branch: 'San Francisco',
      requestDate: '2024-01-25T14:20:00Z',
      status: 'under-review',
      priority: 'medium',
      justification: 'Need professional cameras for content creation and marketing campaigns',
      businessCase: 'High-quality visual content will improve marketing ROI by 25%',
      items: [
        {
          id: 'item-2',
          name: 'Canon EOS R5 Camera',
          category: 'Photography Equipment',
          description: 'Professional mirrorless camera for marketing content',
          quantity: 2,
          unitPrice: 3899,
          totalPrice: 7798,
          specifications: '45MP, 8K video, dual card slots',
          urgency: 'within-quarter',
          vendor: 'Canon USA',
          model: 'EOS-R5-2024',
          warranty: '2 years manufacturer'
        }
      ],
      totalCost: 7798,
      budgetCode: 'MKT-2024-Q1',
      vendorQuotes: []
    }
  ]);

  const [budgetAllocations] = useState<BudgetAllocation[]>([
    { department: 'Engineering', totalBudget: 50000, usedBudget: 15000, remainingBudget: 35000, pendingRequests: 2 },
    { department: 'Marketing', totalBudget: 30000, usedBudget: 8000, remainingBudget: 22000, pendingRequests: 1 },
    { department: 'Design', totalBudget: 25000, usedBudget: 5000, remainingBudget: 20000, pendingRequests: 0 },
    { department: 'HR', totalBudget: 15000, usedBudget: 3000, remainingBudget: 12000, pendingRequests: 1 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<AcquisitionRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'quotes' | 'approval'>('overview');

  const [newRequest, setNewRequest] = useState<Partial<AcquisitionRequest>>({
    department: 'Engineering',
    branch: 'New York',
    priority: 'medium',
    justification: '',
    businessCase: '',
    items: [],
    budgetCode: ''
  });

  const [newItem, setNewItem] = useState<Partial<AcquisitionItem>>({
    name: '',
    category: 'Laptop',
    description: '',
    quantity: 1,
    unitPrice: 0,
    specifications: '',
    urgency: 'within-month'
  });

  const filteredRequests = requests.filter(request => {
    const user = users.find(u => u.id === request.requestedBy);
    const matchesSearch = request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || request.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ordered': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'under-review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'low': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'ordered': return <ShoppingCart className="w-4 h-4" />;
      case 'approved': return <UserCheck className="w-4 h-4" />;
      case 'under-review': return <ClipboardCheck className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewRequest = (request: AcquisitionRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    setActiveTab('overview');
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'approved' as const,
            approvedBy: '5', // Manager
            approvedDate: new Date().toISOString()
          }
        : req
    ));
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'rejected' as const,
            rejectionReason: reason
          }
        : req
    ));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequest.items && newRequest.items.length > 0) {
      const totalCost = newRequest.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const request: AcquisitionRequest = {
        ...newRequest,
        id: `ACQ-${String(requests.length + 1).padStart(3, '0')}`,
        requestedBy: '1', // Current user
        requestDate: new Date().toISOString(),
        status: 'draft',
        totalCost,
        vendorQuotes: []
      } as AcquisitionRequest;

      setRequests([request, ...requests]);
      setIsCreateModalOpen(false);
      setNewRequest({
        department: 'Engineering',
        branch: 'New York',
        priority: 'medium',
        justification: '',
        businessCase: '',
        items: [],
        budgetCode: ''
      });
    }
  };

  const addItemToRequest = () => {
    if (newItem.name && newItem.unitPrice && newItem.quantity) {
      const item: AcquisitionItem = {
        ...newItem,
        id: `item-${Date.now()}`,
        totalPrice: (newItem.unitPrice || 0) * (newItem.quantity || 1)
      } as AcquisitionItem;

      setNewRequest(prev => ({
        ...prev,
        items: [...(prev.items || []), item]
      }));

      setNewItem({
        name: '',
        category: 'Laptop',
        description: '',
        quantity: 1,
        unitPrice: 0,
        specifications: '',
        urgency: 'within-month'
      });
    }
  };

  const removeItemFromRequest = (itemId: string) => {
    setNewRequest(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
  };

  const generatePurchaseOrder = (request: AcquisitionRequest) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(51, 102, 204);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('PURCHASE ORDER', pageWidth / 2, 20, { align: 'center' });
    doc.text(`PO #: ${request.poNumber || 'PENDING'}`, pageWidth / 2, 32, { align: 'center' });
    
    let yPos = 50;

    // Company Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('AssetFlow Enterprise', 20, yPos);
    doc.text('123 Business Ave, Suite 100', 20, yPos + 7);
    doc.text('New York, NY 10001', 20, yPos + 14);
    doc.text('Phone: (555) 123-4567', 20, yPos + 21);
    
    // Vendor Info (if selected)
    if (request.selectedVendor) {
      doc.text('VENDOR:', pageWidth - 80, yPos);
      doc.text(request.selectedVendor, pageWidth - 80, yPos + 7);
    }
    
    yPos += 35;

    // PO Details
    doc.text(`PO Date: ${new Date(request.requestDate).toLocaleDateString()}`, 20, yPos);
    doc.text(`Department: ${request.department}`, 20, yPos + 7);
    doc.text(`Requested By: ${users.find(u => u.id === request.requestedBy)?.name}`, 20, yPos + 14);
    
    yPos += 25;

    // Items Table
    const tableData = request.items.map(item => [
      item.name,
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toLocaleString()}`,
      `$${item.totalPrice.toLocaleString()}`
    ]);

    (doc as any).autoTable({
      head: [['Item', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      startY: yPos,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [51, 102, 204] },
      foot: [['', '', '', 'TOTAL:', `$${request.totalCost.toLocaleString()}`]],
      footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' }
    });

    doc.save(`PO_${request.id}.pdf`);
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  // Calculate summary metrics
  const totalRequests = requests.length;
  const pendingApproval = requests.filter(r => r.status === 'under-review').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const totalValue = requests.reduce((sum, req) => sum + req.totalCost, 0);
  const monthlySpend = requests
    .filter(r => new Date(r.requestDate).getMonth() === new Date().getMonth())
    .reduce((sum, req) => sum + req.totalCost, 0);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Asset Acquisition</h1>
                <p className="text-indigo-200 text-lg">Manage procurement requests and vendor relationships</p>
                <div className="flex items-center space-x-6 mt-3 text-sm text-indigo-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{pendingApproval} Pending Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>${monthlySpend.toLocaleString()} This Month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{approvedRequests} Approved</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Requests"
          value={totalRequests}
          icon={ShoppingCart}
          color="blue"
        />
        <MetricCard
          title="Pending Review"
          value={pendingApproval}
          icon={ClipboardCheck}
          color="yellow"
        />
        <MetricCard
          title="Approved"
          value={approvedRequests}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Total Value"
          value={`$${(totalValue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="purple"
        />
        <MetricCard
          title="Monthly Spend"
          value={`$${(monthlySpend / 1000).toFixed(0)}K`}
          icon={Calculator}
          color="red"
        />
      </div>

      {/* Budget Overview */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Department Budget Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {budgetAllocations.map((budget) => (
            <div key={budget.department} className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{budget.department}</h3>
                <div className="text-sm text-slate-600">
                  {budget.pendingRequests} pending
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Used:</span>
                  <span className="font-medium text-slate-900">${budget.usedBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Remaining:</span>
                  <span className="font-medium text-emerald-600">${budget.remainingBudget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(budget.usedBudget / budget.totalBudget) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 text-center">
                  {Math.round((budget.usedBudget / budget.totalBudget) * 100)}% utilized
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search acquisition requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="ordered">Ordered</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const user = getUserById(request.requestedBy);
          
          return (
            <div
              key={request.id}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(request.status)}
                    <h3 className="text-lg font-bold text-slate-900">{request.id}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Requested by: {user?.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{request.department} - {request.branch}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">${request.totalCost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Items ({request.items.length})</span>
                      <span className="text-sm text-slate-600">Total: ${request.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      {request.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.quantity}x {item.name}</span>
                          <span className="font-medium text-slate-900">${item.totalPrice.toLocaleString()}</span>
                        </div>
                      ))}
                      {request.items.length > 2 && (
                        <div className="text-xs text-slate-500">
                          +{request.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Justification: </span>
                    {request.justification}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewRequest(request)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {request.status === 'approved' && (
                    <button
                      onClick={() => generatePurchaseOrder(request)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Generate PO"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {request.status === 'under-review' && (
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Acquisition Request</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select
                    value={newRequest.department}
                    onChange={(e) => setNewRequest({...newRequest, department: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                  <select
                    value={newRequest.branch}
                    onChange={(e) => setNewRequest({...newRequest, branch: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="New York">New York</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Austin">Austin</option>
                    <option value="Seattle">Seattle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget Code</label>
                  <input
                    type="text"
                    value={newRequest.budgetCode}
                    onChange={(e) => setNewRequest({...newRequest, budgetCode: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., ENG-2024-Q1"
                  />
                </div>
              </div>

              {/* Justification */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Justification</label>
                <textarea
                  value={newRequest.justification}
                  onChange={(e) => setNewRequest({...newRequest, justification: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Explain why these assets are needed..."
                  required
                />
              </div>

              {/* Business Case */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Case</label>
                <textarea
                  value={newRequest.businessCase}
                  onChange={(e) => setNewRequest({...newRequest, businessCase: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Describe the business impact and expected ROI..."
                  required
                />
              </div>

              {/* Add Items Section */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Items</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., MacBook Pro 16"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Software">Software</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                    <select
                      value={newItem.urgency}
                      onChange={(e) => setNewItem({...newItem, urgency: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="within-month">Within Month</option>
                      <option value="within-quarter">Within Quarter</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addItemToRequest}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Description and Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Brief description of the item..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Specifications</label>
                    <textarea
                      value={newItem.specifications}
                      onChange={(e) => setNewItem({...newItem, specifications: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Technical specifications..."
                    />
                  </div>
                </div>

                {/* Items List */}
                {newRequest.items && newRequest.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Request Items</h4>
                    <div className="space-y-2">
                      {newRequest.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-slate-900">{item.quantity}x {item.name}</span>
                              <span className="text-sm text-slate-600">({item.category})</span>
                              <span className="text-sm font-medium text-slate-900">${item.totalPrice.toLocaleString()}</span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItemFromRequest(item.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
                        <span className="font-semibold text-slate-900">Total Cost:</span>
                        <span className="text-xl font-bold text-indigo-900">
                          ${newRequest.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRequest.items?.length}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-200"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRequest.id}</h2>
                    <p className="text-indigo-100">{selectedRequest.department} - {selectedRequest.branch}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'items', label: `Items (${selectedRequest.items.length})` },
                  { id: 'quotes', label: `Quotes (${selectedRequest.vendorQuotes.length})` },
                  { id: 'approval', label: 'Approval' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-slate-900'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Requested By</label>
                        <p className="text-slate-900 font-medium">
                          {getUserById(selectedRequest.requestedBy)?.name}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Request Date</label>
                        <p className="text-slate-900">
                          {new Date(selectedRequest.requestDate).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Cost</label>
                        <p className="text-2xl font-bold text-slate-900">
                          ${selectedRequest.totalCost.toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Budget Code</label>
                        <p className="text-slate-900">{selectedRequest.budgetCode || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Justification</label>
                    <p className="text-slate-600 bg-slate-50 rounded-lg p-4">{selectedRequest.justification}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Business Case</label>
                    <p className="text-slate-600 bg-slate-50 rounded-lg p-4">{selectedRequest.businessCase}</p>
                  </div>
                </div>
              )}

              {/* Items Tab */}
              {activeTab === 'items' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Requested Items</h3>
                    <span className="text-sm text-slate-600">
                      {selectedRequest.items.length} items • ${selectedRequest.totalCost.toLocaleString()} total
                    </span>
                  </div>

                  <div className="space-y-4">
                    {selectedRequest.items.map((item) => (
                      <div key={item.id} className="border border-slate-200 bg-white rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1">{item.name}</h4>
                            <p className="text-sm text-slate-600">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">${item.totalPrice.toLocaleString()}</p>
                            <p className="text-sm text-slate-600">{item.quantity} × ${item.unitPrice.toLocaleString()}</p>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                        )}

                        {item.specifications && (
                          <div className="bg-slate-50 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium text-slate-700 mb-1">Specifications:</p>
                            <p className="text-sm text-slate-600">{item.specifications}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.urgency === 'immediate' ? 'bg-red-100 text-red-800' :
                            item.urgency === 'within-month' ? 'bg-orange-100 text-orange-800' :
                            item.urgency === 'within-quarter' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.urgency.replace('-', ' ')}
                          </span>
                          {item.vendor && (
                            <span className="text-slate-600">Vendor: {item.vendor}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes Tab */}
              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Vendor Quotes</h3>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
                      Request Quote
                    </button>
                  </div>

                  {selectedRequest.vendorQuotes.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">No Quotes Yet</h4>
                      <p className="text-slate-600">Request quotes from vendors to compare pricing and terms.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedRequest.vendorQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          className={`border-2 rounded-xl p-6 ${
                            quote.selected 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{quote.vendorName}</h4>
                              <p className="text-sm text-slate-600">{quote.vendorEmail}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-slate-900">${quote.quotedPrice.toLocaleString()}</p>
                              {quote.selected && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Delivery Time:</span>
                              <p className="text-slate-600">{quote.deliveryTime}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Warranty:</span>
                              <p className="text-slate-600">{quote.warranty}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Valid Until:</span>
                              <p className="text-slate-600">{new Date(quote.validUntil).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {quote.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-sm text-slate-600">{quote.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Approval Tab */}
              {activeTab === 'approval' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">Approval Workflow</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Send className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Request Submitted</p>
                        <p className="text-sm text-slate-600">
                          {new Date(selectedRequest.requestDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedRequest.approvedDate && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Approved</p>
                          <p className="text-sm text-slate-600">
                            by {selectedRequest.approvedBy} on {new Date(selectedRequest.approvedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRequest.rejectionReason && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Rejected</p>
                          <p className="text-sm text-slate-600">{selectedRequest.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedRequest.status === 'under-review' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <h4 className="font-semibold text-amber-900 mb-4">Pending Approval</h4>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            handleApproveRequest(selectedRequest.id);
                            setIsModalOpen(false);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for rejection:');
                            if (reason) {
                              handleRejectRequest(selectedRequest.id, reason);
                              setIsModalOpen(false);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === 'approved' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                      <h4 className="font-semibold text-emerald-900 mb-4">Request Approved</h4>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => generatePurchaseOrder(selectedRequest)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Download className="w-5 h-5" />
                          <span>Generate PO</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No acquisition requests found</h3>
          <p className="text-slate-600">No requests match your current filters.</p>
        </div>
      )}
    </>
  );
}