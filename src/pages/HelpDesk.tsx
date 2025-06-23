import { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  Plus, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Mail,
  Phone,
  Wrench,
  Building,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  X,
  Save,
  Send
} from 'lucide-react';
import { mockMaintenanceRequests, mockHelpDeskEmployees, mockVendors } from '../data/mockMainData';
import { MaintenanceRequest, HelpDeskEmployee, Vendor } from '../types';
import MetricCard from '../components/MetricCard';

export default function HelpDesk() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests);
  const [employees, setEmployees] = useState<HelpDeskEmployee[]>(mockHelpDeskEmployees);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [selectedTab, setSelectedTab] = useState<'my-tickets' | 'team' | 'vendors'>('my-tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketNotes, setTicketNotes] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');

  // Simulate current user as help desk employee
  const currentUser = employees[0]; // Alex Martinez

  // Filter requests assigned to current user
  const myTickets = requests.filter(request => request.assignedTo === currentUser.id);

  const filteredTickets = myTickets.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-emerald-600';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const handleOpenTicket = (ticket: MaintenanceRequest) => {
    setSelectedTicket(ticket);
    setTicketNotes(ticket.notes || '');
    setTicketStatus(ticket.status);
    setIsTicketModalOpen(true);
  };

  const handleUpdateTicket = () => {
    if (!selectedTicket) return;

    const updatedTicket = {
      ...selectedTicket,
      status: ticketStatus as any,
      notes: ticketNotes,
      ...(ticketStatus === 'completed' && { actualCompletion: new Date().toISOString() })
    };

    setRequests(requests.map(req => 
      req.id === selectedTicket.id ? updatedTicket : req
    ));

    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleStartWork = (ticketId: string) => {
    setRequests(requests.map(req => 
      req.id === ticketId ? { ...req, status: 'in-progress' as const } : req
    ));
  };

  const handleCompleteWork = (ticketId: string) => {
    setRequests(requests.map(req => 
      req.id === ticketId ? { 
        ...req, 
        status: 'completed' as const,
        actualCompletion: new Date().toISOString()
      } : req
    ));
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Help Desk Portal</h1>
                <p className="text-orange-200 text-lg">Manage your assigned tickets and support requests</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-orange-100">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Welcome, {currentUser.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4" />
                    <span>{currentUser.specialization.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right text-white">
              <div className="text-3xl font-bold">{myTickets.length}</div>
              <div className="text-orange-200">Assigned Tickets</div>
              <div className="mt-2 text-sm">
                <span className="text-green-300">{myTickets.filter(t => t.status === 'completed').length} Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex space-x-1">
          {[
            { id: 'my-tickets', label: 'My Tickets', icon: Wrench },
            { id: 'team', label: 'Team Overview', icon: Users },
            { id: 'vendors', label: 'Vendor Directory', icon: Building }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Tickets Tab */}
      {selectedTab === 'my-tickets' && (
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Assigned"
              value={myTickets.length}
              icon={Wrench}
              color="blue"
            />
            <MetricCard
              title="In Progress"
              value={myTickets.filter(r => r.status === 'in-progress').length}
              icon={Clock}
              color="purple"
            />
            <MetricCard
              title="Pending"
              value={myTickets.filter(r => r.status === 'pending').length}
              icon={AlertTriangle}
              color="yellow"
            />
            <MetricCard
              title="Completed"
              value={myTickets.filter(r => r.status === 'completed').length}
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="text-lg font-semibold text-slate-900">{ticket.title}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ticket.priority} priority
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{ticket.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Asset: {ticket.assetId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          Submitted: {new Date(ticket.submittedDate).toLocaleDateString()}
                        </span>
                      </div>
                      {ticket.estimatedCompletion && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            Due: {new Date(ticket.estimatedCompletion).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleOpenTicket(ticket)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {ticket.status === 'pending' && (
                      <button
                        onClick={() => handleStartWork(ticket.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Start Work
                      </button>
                    )}
                    
                    {ticket.status === 'in-progress' && (
                      <button
                        onClick={() => handleCompleteWork(ticket.id)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>

                {ticket.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      <strong>Notes:</strong> {ticket.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
              <p className="text-slate-600">No tickets match your current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Team Tab */}
      {selectedTab === 'team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(employee => (
              <div key={employee.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                      <p className="text-sm text-slate-600">{employee.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    employee.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.available ? 'Available' : 'Busy'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {employee.specialization.map(spec => (
                        <span key={spec} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Current Workload</span>
                    <span className="text-lg font-bold text-slate-900">{employee.workload}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {selectedTab === 'vendors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.map(vendor => (
              <div key={vendor.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{vendor.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'text-yellow-500 fill-current' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">({vendor.rating})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${vendor.hourlyRate}/hr</p>
                    <p className="text-sm text-slate-600">{vendor.responseTime}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{vendor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{vendor.phone}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialization.map(spec => (
                        <span key={spec} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {isTicketModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Ticket Details</h2>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ticket Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Ticket Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <p className="text-slate-900 font-medium">{selectedTicket.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <p className="text-slate-600">{selectedTicket.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedTicket.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {selectedTicket.priority}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <p className="text-slate-900">{selectedTicket.category}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Asset ID</label>
                      <p className="text-slate-900">{selectedTicket.assetId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Submitted Date</label>
                      <p className="text-slate-900">{new Date(selectedTicket.submittedDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions and Updates */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Ticket</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={ticketStatus}
                        onChange={(e) => setTicketStatus(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Work Notes</label>
                      <textarea
                        value={ticketNotes}
                        onChange={(e) => setTicketNotes(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="Add your work notes, findings, or resolution details..."
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleUpdateTicket}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Save className="w-5 h-5" />
                        <span>Update Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Warranty Information */}
                {selectedTicket.warrantyEligible && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Warranty Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Warranty Eligible:</span>
                        <span className="font-medium text-blue-900">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Warranty Used:</span>
                        <span className="font-medium text-blue-900">
                          {selectedTicket.warrantyUsed ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {selectedTicket.cost !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Cost:</span>
                          <span className="font-medium text-blue-900">
                            ${selectedTicket.cost}
                          </span>
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
    </>
  );
}