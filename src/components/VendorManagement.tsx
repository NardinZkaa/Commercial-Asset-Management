import { useState } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Star, 
  Mail, 
  Phone, 
  Clock, 
  DollarSign,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  Calendar
} from 'lucide-react';

interface Vendor {
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
  avgDeliveryTime: number; // in days
  qualityScore: number;
  onTimeDelivery: number; // percentage
  certifications: string[];
  paymentTerms: string;
  notes?: string;
}

interface VendorPerformance {
  vendorId: string;
  ordersCompleted: number;
  avgDeliveryTime: number;
  onTimePercentage: number;
  qualityRating: number;
  costSavings: number;
  issuesReported: number;
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'VND-001',
      name: 'TechSource Pro',
      email: 'sales@techsource.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, San Francisco, CA 94105',
      specialization: ['Laptops', 'Monitors', 'Accessories'],
      rating: 4.8,
      responseTime: '2-4 hours',
      hourlyRate: 85,
      contractStatus: 'active',
      contractExpiry: '2024-12-31',
      totalOrders: 45,
      totalValue: 125000,
      avgDeliveryTime: 3,
      qualityScore: 4.7,
      onTimeDelivery: 94,
      certifications: ['ISO 9001', 'Apple Authorized Reseller'],
      paymentTerms: 'Net 30',
      notes: 'Preferred vendor for Apple products'
    },
    {
      id: 'VND-002',
      name: 'Enterprise Solutions Inc',
      email: 'procurement@enterprisesol.com',
      phone: '+1-555-0456',
      address: '456 Business Blvd, Austin, TX 78701',
      specialization: ['Software', 'Licenses', 'Cloud Services'],
      rating: 4.6,
      responseTime: '1-2 hours',
      contractStatus: 'active',
      contractExpiry: '2025-06-30',
      totalOrders: 32,
      totalValue: 89000,
      avgDeliveryTime: 1,
      qualityScore: 4.5,
      onTimeDelivery: 97,
      certifications: ['Microsoft Partner', 'AWS Partner'],
      paymentTerms: 'Net 15',
      notes: 'Excellent for software licensing'
    },
    {
      id: 'VND-003',
      name: 'Office Furniture Direct',
      email: 'orders@officefurniture.com',
      phone: '+1-555-0789',
      address: '789 Furniture Way, Seattle, WA 98101',
      specialization: ['Furniture', 'Office Equipment'],
      rating: 4.3,
      responseTime: '4-6 hours',
      contractStatus: 'pending',
      totalOrders: 18,
      totalValue: 45000,
      avgDeliveryTime: 7,
      qualityScore: 4.2,
      onTimeDelivery: 89,
      certifications: ['GREENGUARD Certified'],
      paymentTerms: 'Net 45'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'performance' | 'contracts'>('details');

  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: [],
    rating: 5,
    responseTime: '',
    contractStatus: 'pending',
    paymentTerms: 'Net 30'
  });

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'terminated': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor: Vendor = {
      ...newVendor,
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      totalOrders: 0,
      totalValue: 0,
      avgDeliveryTime: 0,
      qualityScore: newVendor.rating || 5,
      onTimeDelivery: 100,
      certifications: []
    } as Vendor;

    setVendors([...vendors, vendor]);
    setIsAddModalOpen(false);
    setNewVendor({
      name: '',
      email: '',
      phone: '',
      address: '',
      specialization: [],
      rating: 5,
      responseTime: '',
      contractStatus: 'pending',
      paymentTerms: 'Net 30'
    });
  };

  const specializations = ['Laptops', 'Monitors', 'Mobile Devices', 'Software', 'Licenses', 'Furniture', 'Equipment', 'Accessories'];

  const toggleSpecialization = (spec: string) => {
    setNewVendor(prev => ({
      ...prev,
      specialization: prev.specialization?.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...(prev.specialization || []), spec]
    }));
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Vendor Management</h2>
              <p className="text-blue-200">Manage vendor relationships and performance</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Vendor Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{vendors.length}</p>
              <p className="text-sm font-medium text-slate-600">Active Vendors</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
              </p>
              <p className="text-sm font-medium text-slate-600">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {Math.round(vendors.reduce((sum, v) => sum + v.onTimeDelivery, 0) / vendors.length)}%
              </p>
              <p className="text-sm font-medium text-slate-600">On-Time Delivery</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                ${(vendors.reduce((sum, v) => sum + v.totalValue, 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => {
              setSelectedVendor(vendor);
              setIsModalOpen(true);
            }}
          >
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
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getContractStatusColor(vendor.contractStatus)}`}>
                {vendor.contractStatus}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{vendor.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{vendor.responseTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{vendor.onTimeDelivery}% on-time</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.specialization.slice(0, 3).map(spec => (
                    <span key={spec} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {spec}
                    </span>
                  ))}
                  {vendor.specialization.length > 3 && (
                    <span className="text-xs text-slate-500">+{vendor.specialization.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <div className="text-sm">
                  <span className="text-slate-600">Total Orders: </span>
                  <span className="font-medium text-slate-900">{vendor.totalOrders}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Value: </span>
                  <span className="font-medium text-slate-900">${(vendor.totalValue / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add New Vendor</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Response Time</label>
                  <input
                    type="text"
                    value={newVendor.responseTime}
                    onChange={(e) => setNewVendor({...newVendor, responseTime: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2-4 hours"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <textarea
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({...newVendor, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specializations.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVendor.specialization?.includes(spec) || false}
                        onChange={() => toggleSpecialization(spec)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Initial Rating</label>
                  <select
                    value={newVendor.rating}
                    onChange={(e) => setNewVendor({...newVendor, rating: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4.5}>4.5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3.5}>3.5 Stars</option>
                    <option value={3}>3 Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Terms</label>
                  <select
                    value={newVendor.paymentTerms}
                    onChange={(e) => setNewVendor({...newVendor, paymentTerms: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {isModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedVendor.name}</h2>
                    <p className="text-blue-100">{selectedVendor.specialization.join(', ')}</p>
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
                  { id: 'details', label: 'Details' },
                  { id: 'performance', label: 'Performance' },
                  { id: 'contracts', label: 'Contracts' }
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
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Information</label>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{selectedVendor.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{selectedVendor.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <p className="text-sm text-slate-900">{selectedVendor.address}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Performance Metrics</label>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Rating:</span>
                            <span className="font-medium text-slate-900">{selectedVendor.rating}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">On-time Delivery:</span>
                            <span className="font-medium text-slate-900">{selectedVendor.onTimeDelivery}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Quality Score:</span>
                            <span className="font-medium text-slate-900">{selectedVendor.qualityScore}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Certifications</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.certifications.map(cert => (
                        <span key={cert} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Total Orders</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{selectedVendor.totalOrders}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-900">Total Value</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-900">${(selectedVendor.totalValue / 1000).toFixed(0)}K</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Avg Delivery</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{selectedVendor.avgDeliveryTime} days</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Performance Breakdown</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">On-Time Delivery</span>
                          <span className="text-sm font-bold text-slate-900">{selectedVendor.onTimeDelivery}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${selectedVendor.onTimeDelivery}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Quality Score</span>
                          <span className="text-sm font-bold text-slate-900">{selectedVendor.qualityScore}/5</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(selectedVendor.qualityScore / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Contract Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getContractStatusColor(selectedVendor.contractStatus)}`}>
                          {selectedVendor.contractStatus}
                        </span>
                      </div>
                      
                      {selectedVendor.contractExpiry && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Contract Expiry</label>
                          <p className="text-slate-900">{new Date(selectedVendor.contractExpiry).toLocaleDateString()}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                        <p className="text-slate-900">{selectedVendor.paymentTerms}</p>
                      </div>

                      {selectedVendor.hourlyRate && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate</label>
                          <p className="text-slate-900">${selectedVendor.hourlyRate}/hour</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}