import { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  X, 
  User, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Package,
  UserCheck,
  FileText,
  Download,
  MessageSquare,
  Settings,
  TrendingUp,
  DollarSign,
  Calculator,
  Save
} from 'lucide-react';
import { mockMaintenanceRequests, mockHelpDeskEmployees, mockVendors } from '../data/mockMainData';
import { MaintenanceRequest, HelpDeskEmployee, Vendor } from '../types';
import MetricCard from '../components/MetricCard';

export default function MaintenanceRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests);
  const [employees] = useState<HelpDeskEmployee[]>(mockHelpDeskEmployees);
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assigneeType, setAssigneeType] = useState<'helpdesk' | 'vendor'>('helpdesk');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [partsCost, setPartsCost] = useState('');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate total maintenance costs
  const totalMaintenanceCost = requests
    .filter(r => r.status === 'completed' && r.cost !== undefined)
    .reduce((sum, r) => sum + (r.cost || 0), 0);

  const avgMaintenanceCost = requests
    .filter(r => r.status === 'completed' && r.cost !== undefined)
    .reduce((sum, r, _, arr) => sum + (r.cost || 0) / arr.length, 0);

  const monthlyMaintenanceCost = requests
    .filter(r => {
      const completedThisMonth = r.status === 'completed' && 
        new Date(r.actualCompletion || '').getMonth() === new Date().getMonth();
      return completedThisMonth && r.cost !== undefined;
    })
    .reduce((sum, r) => sum + (r.cost || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
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
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setApprovalNotes(request.notes || '');
    setEstimatedCost(request.estimatedCost?.toString() || '');
    setLaborCost(request.laborCost?.toString() || '');
    setPartsCost(request.partsCost?.toString() || '');
    setIsModalOpen(true);
  };

  const handleApproveAndAssign = () => {
    if (!selectedRequest || !selectedAssignee) return;

    const updatedRequest = {
      ...selectedRequest,
      status: 'in-progress' as const,
      assignedTo: selectedAssignee,
      assignedType: assigneeType,
      notes: approvalNotes,
      estimatedCost: parseFloat(estimatedCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      partsCost: parseFloat(partsCost) || 0,
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      approvedBy: 'Current Manager', // In real app, this would be the logged-in user
      approvedDate: new Date().toISOString()
    };

    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? updatedRequest : req
    ));

    setIsModalOpen(false);
    setSelectedRequest(null);
    setSelectedAssignee('');
    setApprovalNotes('');
    setEstimatedCost('');
    setLaborCost('');
    setPartsCost('');
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;

    const updatedRequest = {
      ...selectedRequest,
      status: 'cancelled' as const,
      notes: approvalNotes
    };

    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? updatedRequest : req
    ));

    setIsModalOpen(false);
    setSelectedRequest(null);
    setApprovalNotes('');
  };

  const getAssigneeName = (request: MaintenanceRequest) => {
    if (!request.assignedTo) return 'Unassigned';
    
    if (request.assignedType === 'helpdesk') {
      const employee = employees.find(emp => emp.id === request.assignedTo);
      return employee ? employee.name : 'Unknown Employee';
    } else {
      const vendor = vendors.find(v => v.id === request.assignedTo);
      return vendor ? vendor.name : 'Unknown Vendor';
    }
  };

  const getAssigneeRate = (request: MaintenanceRequest) => {
    if (!request.assignedTo) return 0;
    
    if (request.assignedType === 'helpdesk') {
      const employee = employees.find(emp => emp.id === request.assignedTo);
      return employee?.hourlyRate || 0;
    } else {
      const vendor = vendors.find(v => v.id === request.assignedTo);
      return vendor?.hourlyRate || 0;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Maintenance Requests</h1>
              <p className="text-purple-200 text-lg">Review, approve, and assign maintenance tickets</p>
              <div className="flex items-center space-x-6 mt-3 text-sm text-purple-100">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{requests.filter(r => r.status === 'pending').length} Pending Approval</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{requests.filter(r => r.status === 'in-progress').length} In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>${monthlyMaintenanceCost.toLocaleString()} This Month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Requests"
          value={requests.length}
          icon={Wrench}
          color="blue"
        />
        <MetricCard
          title="Pending Approval"
          value={requests.filter(r => r.status === 'pending').length}
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard
          title="In Progress"
          value={requests.filter(r => r.status === 'in-progress').length}
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Completed"
          value={requests.filter(r => r.status === 'completed').length}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Total Cost"
          value={`$${totalMaintenanceCost.toLocaleString()}`}
          icon={DollarSign}
          color="red"
        />
      </div>

      {/* Cost Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">${monthlyMaintenanceCost.toLocaleString()}</p>
              <p className="text-sm font-medium text-blue-700">Monthly Cost</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">${Math.round(avgMaintenanceCost).toLocaleString()}</p>
              <p className="text-sm font-medium text-emerald-700">Average Cost</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">${totalMaintenanceCost.toLocaleString()}</p>
              <p className="text-sm font-medium text-purple-700">Total Cost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search maintenance requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Request</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{request.title}</div>
                      <div className="text-sm text-slate-500">Asset: {request.assetId}</div>
                      <div className="text-sm text-slate-500">{request.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {request.cost !== undefined ? (
                        <span className="font-medium text-slate-900">${request.cost}</span>
                      ) : request.estimatedCost ? (
                        <span className="text-slate-600">~${request.estimatedCost}</span>
                      ) : (
                        <span className="text-slate-400">TBD</span>
                      )}
                    </div>
                    {request.warrantyEligible && (
                      <div className="text-xs text-blue-600">Warranty</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {new Date(request.submittedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{getAssigneeName(request)}</div>
                    {request.assignedType && (
                      <div className="text-xs text-slate-500">
                        {request.assignedType === 'vendor' ? 'External Vendor' : 'Help Desk'}
                        {request.assignedTo && (
                          <span className="ml-1">(${getAssigneeRate(request)}/hr)</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Maintenance Request Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <p className="text-slate-900 font-medium">{selectedRequest.title}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{selectedRequest.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <p className="text-slate-900">{selectedRequest.category}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Asset ID</label>
                        <p className="text-slate-900">{selectedRequest.assetId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Submitted Date</label>
                        <p className="text-slate-900">{new Date(selectedRequest.submittedDate).toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedRequest.warrantyEligible && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Warranty Information</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Warranty Eligible:</span>
                            <span className="font-medium text-blue-900">Yes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Warranty Used:</span>
                            <span className="font-medium text-blue-900">
                              {selectedRequest.warrantyUsed ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignment and Cost Management */}
              <div className="space-y-6">
                {selectedRequest.status === 'pending' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Assignment & Cost Estimation</h3>
                    <div className="space-y-4">
                      {/* Cost Estimation */}
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Cost Breakdown</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Labor Cost ($)</label>
                            <input
                              type="number"
                              value={laborCost}
                              onChange={(e) => setLaborCost(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Parts Cost ($)</label>
                            <input
                              type="number"
                              value={partsCost}
                              onChange={(e) => setPartsCost(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-700">Total Estimated Cost:</span>
                            <span className="text-lg font-bold text-slate-900">
                              ${((parseFloat(laborCost) || 0) + (parseFloat(partsCost) || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                        <div className="flex space-x-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="helpdesk"
                              checked={assigneeType === 'helpdesk'}
                              onChange={(e) => setAssigneeType(e.target.value as 'helpdesk')}
                              className="mr-2"
                            />
                            <span className="text-sm font-medium text-slate-700">Help Desk Team</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="vendor"
                              checked={assigneeType === 'vendor'}
                              onChange={(e) => setAssigneeType(e.target.value as 'vendor')}
                              className="mr-2"
                            />
                            <span className="text-sm font-medium text-slate-700">External Vendor</span>
                          </label>
                        </div>
                        
                        <select
                          value={selectedAssignee}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select assignee...</option>
                          {assigneeType === 'helpdesk' 
                            ? employees.filter(emp => emp.available).map(employee => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.name} (Workload: {employee.workload}, ${employee.hourlyRate}/hr)
                                </option>
                              ))
                            : vendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.name} (${vendor.hourlyRate}/hr, Rating: {vendor.rating})
                                </option>
                              ))
                          }
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Approval Notes</label>
                        <textarea
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Add any notes or instructions for the assignee..."
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={handleApproveAndAssign}
                          disabled={!selectedAssignee}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <UserCheck className="w-5 h-5" />
                          <span>Approve & Assign</span>
                        </button>
                        
                        <button
                          onClick={handleRejectRequest}
                          className="px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors duration-200 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.status !== 'pending' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Assignment Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                        <p className="text-slate-900 font-medium">{getAssigneeName(selectedRequest)}</p>
                        <p className="text-sm text-slate-600">
                          {selectedRequest.assignedType === 'vendor' ? 'External Vendor' : 'Help Desk Team'}
                          {selectedRequest.assignedTo && (
                            <span className="ml-1">(${getAssigneeRate(selectedRequest)}/hr)</span>
                          )}
                        </p>
                      </div>

                      {/* Cost Information */}
                      {(selectedRequest.estimatedCost || selectedRequest.cost) && (
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 mb-3">Cost Information</h4>
                          <div className="space-y-2 text-sm">
                            {selectedRequest.laborCost && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Labor Cost:</span>
                                <span className="font-medium text-slate-900">${selectedRequest.laborCost}</span>
                              </div>
                            )}
                            {selectedRequest.partsCost && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Parts Cost:</span>
                                <span className="font-medium text-slate-900">${selectedRequest.partsCost}</span>
                              </div>
                            )}
                            {selectedRequest.timeSpent && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Time Spent:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.timeSpent}h</span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-slate-200">
                              <div className="flex justify-between">
                                <span className="font-medium text-slate-700">
                                  {selectedRequest.status === 'completed' ? 'Final Cost:' : 'Estimated Cost:'}
                                </span>
                                <span className="text-lg font-bold text-slate-900">
                                  ${(selectedRequest.cost || selectedRequest.estimatedCost || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedRequest.estimatedCompletion && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Completion</label>
                          <p className="text-slate-900">{new Date(selectedRequest.estimatedCompletion).toLocaleString()}</p>
                        </div>
                      )}
                      
                      {selectedRequest.actualCompletion && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Completed On</label>
                          <p className="text-slate-900">{new Date(selectedRequest.actualCompletion).toLocaleString()}</p>
                        </div>
                      )}
                      
                      {selectedRequest.notes && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                          <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{selectedRequest.notes}</p>
                        </div>
                      )}

                      {selectedRequest.resolution && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Resolution</label>
                          <p className="text-slate-600 bg-emerald-50 rounded-lg p-3">{selectedRequest.resolution}</p>
                        </div>
                      )}

                      {selectedRequest.approvedBy && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Approved By</label>
                          <p className="text-slate-900">{selectedRequest.approvedBy}</p>
                          {selectedRequest.approvedDate && (
                            <p className="text-sm text-slate-600">
                              on {new Date(selectedRequest.approvedDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No maintenance requests found</h3>
          <p className="text-slate-600">No requests match your current filters.</p>
        </div>
      )}
    </>
  );
}