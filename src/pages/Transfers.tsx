import { useState } from 'react';
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CheckCircle, 
  X, 
  Clock, 
  User, 
  Package, 
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Send,
  Building,
  Truck,
  ClipboardCheck,
  UserCheck,
  History
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { mockAssets, mockUsers } from '../data/mockMainData';
import { Asset, User as UserType } from '../types';
import MetricCard from '../components/MetricCard';

interface TransferRequest {
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

export default function Transfers() {
  const [assets] = useState<Asset[]>(mockAssets);
  const [users] = useState<UserType[]>(mockUsers);
  const [transfers, setTransfers] = useState<TransferRequest[]>([
    {
      id: 'TRF-001',
      assetId: 'AST-001',
      fromUserId: '1',
      toUserId: '2',
      transferType: 'user',
      reason: 'Employee role change - needs higher spec laptop',
      requestedBy: '1',
      requestedDate: '2024-01-20T10:00:00Z',
      approvedBy: '5',
      approvedDate: '2024-01-20T14:30:00Z',
      status: 'approved',
      priority: 'medium',
      requiresApproval: true,
      estimatedDelivery: '2024-01-25T17:00:00Z'
    },
    {
      id: 'TRF-002',
      assetId: 'AST-003',
      fromBranch: 'Austin',
      toBranch: 'Seattle',
      transferType: 'branch',
      reason: 'Branch expansion - mobile device needed for new team member',
      requestedBy: '4',
      requestedDate: '2024-01-22T09:15:00Z',
      status: 'pending',
      priority: 'high',
      requiresApproval: true,
      transferCost: 50
    },
    {
      id: 'TRF-003',
      assetId: 'AST-002',
      fromUserId: '2',
      toUserId: '3',
      transferType: 'user',
      reason: 'Project assignment change',
      requestedBy: '2',
      requestedDate: '2024-01-18T16:45:00Z',
      completedDate: '2024-01-19T11:20:00Z',
      status: 'completed',
      priority: 'low',
      requiresApproval: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTransfer, setNewTransfer] = useState<Partial<TransferRequest>>({
    assetId: '',
    transferType: 'user',
    reason: '',
    priority: 'medium',
    requiresApproval: true
  });

  const filteredTransfers = transfers.filter(transfer => {
    const asset = assets.find(a => a.id === transfer.assetId);
    const matchesSearch = asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesType = typeFilter === 'all' || transfer.transferType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
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
      case 'approved': return <UserCheck className="w-4 h-4" />;
      case 'in-transit': return <Truck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <ArrowRightLeft className="w-4 h-4" />;
    }
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const transfer: TransferRequest = {
      ...newTransfer,
      id: `TRF-${String(transfers.length + 1).padStart(3, '0')}`,
      requestedBy: '1', // Current user
      requestedDate: new Date().toISOString(),
      status: 'pending'
    } as TransferRequest;

    setTransfers([transfer, ...transfers]);
    setIsCreateModalOpen(false);
    setNewTransfer({
      assetId: '',
      transferType: 'user',
      reason: '',
      priority: 'medium',
      requiresApproval: true
    });
  };

  const handleApproveTransfer = (transferId: string) => {
    setTransfers(transfers.map(transfer => 
      transfer.id === transferId 
        ? { 
            ...transfer, 
            status: 'approved' as const,
            approvedBy: '5', // Manager
            approvedDate: new Date().toISOString()
          }
        : transfer
    ));
  };

  const handleCompleteTransfer = (transferId: string) => {
    setTransfers(transfers.map(transfer => 
      transfer.id === transferId 
        ? { 
            ...transfer, 
            status: 'completed' as const,
            completedDate: new Date().toISOString()
          }
        : transfer
    ));
  };

  const generateTransferDocument = (transfer: TransferRequest) => {
    const asset = assets.find(a => a.id === transfer.assetId);
    const fromUser = transfer.fromUserId ? users.find(u => u.id === transfer.fromUserId) : null;
    const toUser = transfer.toUserId ? users.find(u => u.id === transfer.toUserId) : null;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(51, 102, 204);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Asset Transfer Document', pageWidth / 2, 15, { align: 'center' });
    doc.text(`Transfer ID: ${transfer.id}`, pageWidth / 2, 30, { align: 'center' });
    
    let yPos = 50;

    // Transfer Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Transfer Details:', 20, yPos);
    yPos += 10;

    const details = [
      ['Asset:', asset?.name || 'Unknown'],
      ['Asset ID:', transfer.assetId],
      ['Transfer Type:', transfer.transferType.charAt(0).toUpperCase() + transfer.transferType.slice(1)],
      ['Reason:', transfer.reason],
      ['Priority:', transfer.priority.charAt(0).toUpperCase() + transfer.priority.slice(1)],
      ['Requested Date:', new Date(transfer.requestedDate).toLocaleString()],
      ['Status:', transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)]
    ];

    if (transfer.transferType === 'user') {
      details.push(['From User:', fromUser?.name || 'Unknown']);
      details.push(['To User:', toUser?.name || 'Unknown']);
    } else if (transfer.transferType === 'branch') {
      details.push(['From Branch:', transfer.fromBranch || 'Unknown']);
      details.push(['To Branch:', transfer.toBranch || 'Unknown']);
    }

    details.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 20, yPos);
      yPos += 7;
    });

    doc.save(`Transfer_${transfer.id}.pdf`);
  };

  const getAssetById = (assetId: string) => assets.find(a => a.id === assetId);
  const getUserById = (userId: string) => users.find(u => u.id === userId);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <ArrowRightLeft className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Asset Transfers</h1>
                <p className="text-emerald-200 text-lg">Manage asset transfers and relocation requests</p>
                <div className="flex items-center space-x-6 mt-3 text-sm text-emerald-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{transfers.filter(t => t.status === 'pending').length} Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <span>{transfers.filter(t => t.status === 'in-transit').length} In Transit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{transfers.filter(t => t.status === 'completed').length} Completed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Transfers"
          value={transfers.length}
          icon={ArrowRightLeft}
          color="blue"
        />
        <MetricCard
          title="Pending Approval"
          value={transfers.filter(t => t.status === 'pending').length}
          icon={Clock}
          color="yellow"
        />
        <MetricCard
          title="In Transit"
          value={transfers.filter(t => t.status === 'in-transit').length}
          icon={Truck}
          color="purple"
        />
        <MetricCard
          title="Completed"
          value={transfers.filter(t => t.status === 'completed').length}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="This Month"
          value={transfers.filter(t => 
            new Date(t.requestedDate).getMonth() === new Date().getMonth()
          ).length}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transfers by asset, user, or transfer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in-transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="user">User Transfer</option>
              <option value="branch">Branch Transfer</option>
              <option value="location">Location Transfer</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.map((transfer) => {
          const asset = getAssetById(transfer.assetId);
          const fromUser = transfer.fromUserId ? getUserById(transfer.fromUserId) : null;
          const toUser = transfer.toUserId ? getUserById(transfer.toUserId) : null;
          
          return (
            <div
              key={transfer.id}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(transfer.status)}
                    <h3 className="text-lg font-bold text-slate-900">{transfer.id}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transfer.status)}`}>
                      {transfer.status.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(transfer.priority)}`}>
                      {transfer.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Asset: {asset?.name || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        Type: {transfer.transferType.charAt(0).toUpperCase() + transfer.transferType.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        Requested: {new Date(transfer.requestedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {transfer.estimatedDelivery && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          ETA: {new Date(transfer.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Transfer Details */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {transfer.transferType === 'user' && (
                        <>
                          <div>
                            <span className="font-medium text-slate-700">From: </span>
                            <span className="text-slate-900">{fromUser?.name || 'Unassigned'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">To: </span>
                            <span className="text-slate-900">{toUser?.name || 'Unknown'}</span>
                          </div>
                        </>
                      )}
                      
                      {transfer.transferType === 'branch' && (
                        <>
                          <div>
                            <span className="font-medium text-slate-700">From Branch: </span>
                            <span className="text-slate-900">{transfer.fromBranch}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">To Branch: </span>
                            <span className="text-slate-900">{transfer.toBranch}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-700">Reason: </span>
                      <span className="text-slate-900">{transfer.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedTransfer(transfer);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => generateTransferDocument(transfer)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {transfer.status === 'pending' && transfer.requiresApproval && (
                    <button
                      onClick={() => handleApproveTransfer(transfer.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Approve
                    </button>
                  )}

                  {transfer.status === 'approved' && (
                    <button
                      onClick={() => handleCompleteTransfer(transfer.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Transfer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Transfer Request</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Asset</label>
                <select
                  value={newTransfer.assetId}
                  onChange={(e) => setNewTransfer({...newTransfer, assetId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id}) - {asset.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Transfer Type</label>
                <select
                  value={newTransfer.transferType}
                  onChange={(e) => setNewTransfer({...newTransfer, transferType: e.target.value as any})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="user">User Transfer</option>
                  <option value="branch">Branch Transfer</option>
                  <option value="location">Location Transfer</option>
                </select>
              </div>

              {/* Conditional fields based on transfer type */}
              {newTransfer.transferType === 'user' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">From User</label>
                    <select
                      value={newTransfer.fromUserId || ''}
                      onChange={(e) => setNewTransfer({...newTransfer, fromUserId: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Current User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">To User</label>
                    <select
                      value={newTransfer.toUserId || ''}
                      onChange={(e) => setNewTransfer({...newTransfer, toUserId: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name} - {user.department}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {newTransfer.transferType === 'branch' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">From Branch</label>
                    <select
                      value={newTransfer.fromBranch || ''}
                      onChange={(e) => setNewTransfer({...newTransfer, fromBranch: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="New York">New York</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="Austin">Austin</option>
                      <option value="Seattle">Seattle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">To Branch</label>
                    <select
                      value={newTransfer.toBranch || ''}
                      onChange={(e) => setNewTransfer({...newTransfer, toBranch: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="New York">New York</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="Austin">Austin</option>
                      <option value="Seattle">Seattle</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={newTransfer.priority}
                    onChange={(e) => setNewTransfer({...newTransfer, priority: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-8">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTransfer.requiresApproval}
                      onChange={(e) => setNewTransfer({...newTransfer, requiresApproval: e.target.checked})}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Requires Approval</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Transfer</label>
                <textarea
                  value={newTransfer.reason}
                  onChange={(e) => setNewTransfer({...newTransfer, reason: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Provide detailed reason for this transfer request..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200"
                >
                  Create Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Detail Modal */}
      {isModalOpen && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Transfer Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transfer Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Transfer Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transfer ID</label>
                      <p className="text-slate-900 font-medium">{selectedTransfer.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Asset</label>
                      <p className="text-slate-900">{getAssetById(selectedTransfer.assetId)?.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Type</label>
                      <p className="text-slate-900 capitalize">{selectedTransfer.transferType}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransfer.status)}`}>
                        {selectedTransfer.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                      <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{selectedTransfer.reason}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline and Actions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Transfer Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Send className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Request Submitted</p>
                        <p className="text-sm text-slate-600">
                          {new Date(selectedTransfer.requestedDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedTransfer.approvedDate && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Approved</p>
                          <p className="text-sm text-slate-600">
                            {new Date(selectedTransfer.approvedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTransfer.completedDate && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Completed</p>
                          <p className="text-sm text-slate-600">
                            {new Date(selectedTransfer.completedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => generateTransferDocument(selectedTransfer)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Transfer Document</span>
                  </button>

                  {selectedTransfer.status === 'pending' && selectedTransfer.requiresApproval && (
                    <button
                      onClick={() => {
                        handleApproveTransfer(selectedTransfer.id);
                        setIsModalOpen(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>Approve Transfer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTransfers.length === 0 && (
        <div className="text-center py-12">
          <ArrowRightLeft className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No transfers found</h3>
          <p className="text-slate-600">No transfers match your current filters.</p>
        </div>
      )}
    </>
  );
}