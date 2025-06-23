import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Save, 
  Building, 
  Package, 
  Users, 
  Wrench, 
  Shield, 
  Bell,
  Database,
  Mail,
  Phone,
  Star,
  Clock,
  DollarSign,
  User,
  MapPin,
  Tag,
  AlertTriangle,
  CheckCircle,
  Calculator,
  TrendingDown,
  Percent
} from 'lucide-react';
import { mockHelpDeskEmployees, mockVendors } from '../data/mockMainData';
import { HelpDeskEmployee, Vendor } from '../types';

export default function Settings() {
  // Basic Settings
  const [branches, setBranches] = useState<string[]>(['New York', 'San Francisco', 'Austin', 'Seattle']);
  const [categories, setCategories] = useState<string[]>(['Laptop', 'Monitor', 'Mobile', 'Tablet', 'Desktop']);
  const [departments, setDepartments] = useState<string[]>(['Engineering', 'Marketing', 'Design', 'HR', 'Finance']);
  
  // Help Desk & Vendors
  const [helpDeskEmployees, setHelpDeskEmployees] = useState<HelpDeskEmployee[]>(mockHelpDeskEmployees);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  
  // Form states
  const [newBranch, setNewBranch] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  
  // Modal states
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<HelpDeskEmployee | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  // New employee/vendor forms
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    specialization: [] as string[],
    workload: 0,
    available: true
  });
  
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    rating: 5,
    responseTime: '',
    hourlyRate: 0
  });

  // Depreciation settings
  const [depreciationSettings, setDepreciationSettings] = useState({
    method: 'straight-line' as 'straight-line' | 'declining-balance' | 'custom',
    defaultLifespan: {
      'Electronics': 3,
      'Furniture': 7,
      'Vehicles': 5,
      'Equipment': 5,
      'Laptop': 3,
      'Monitor': 5,
      'Mobile': 2,
      'Tablet': 3,
      'Desktop': 4
    },
    customRates: {
      'Electronics': 25,
      'Furniture': 10,
      'Vehicles': 20,
      'Equipment': 15,
      'Laptop': 30,
      'Monitor': 15,
      'Mobile': 40,
      'Tablet': 25,
      'Desktop': 20
    },
    salvageValuePercentage: 10
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    autoAssignRequests: true,
    emailNotifications: true,
    warrantyAlerts: true,
    maintenanceReminders: true,
    auditFrequency: 'quarterly',
    defaultWarrantyPeriod: 12,
    maxFileSize: 10,
    allowedFileTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  });

  const specializations = ['Hardware', 'Software', 'Network', 'Mobile', 'Security', 'Apple Products', 'Laptop Repair', 'Infrastructure', 'System Integration'];

  // Basic list management functions
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBranch.trim() && !branches.includes(newBranch.trim())) {
      setBranches([...branches, newBranch.trim()]);
      setNewBranch('');
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  // Help desk employee management
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: HelpDeskEmployee = {
      id: `HD-${String(helpDeskEmployees.length + 1).padStart(3, '0')}`,
      ...newEmployee
    };
    setHelpDeskEmployees([...helpDeskEmployees, employee]);
    setNewEmployee({
      name: '',
      email: '',
      specialization: [],
      workload: 0,
      available: true
    });
    setIsAddEmployeeModalOpen(false);
  };

  const handleUpdateEmployee = (employee: HelpDeskEmployee) => {
    setHelpDeskEmployees(helpDeskEmployees.map(emp => 
      emp.id === employee.id ? employee : emp
    ));
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    setHelpDeskEmployees(helpDeskEmployees.filter(emp => emp.id !== id));
  };

  // Vendor management
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor: Vendor = {
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      ...newVendor
    };
    setVendors([...vendors, vendor]);
    setNewVendor({
      name: '',
      email: '',
      phone: '',
      specialization: [],
      rating: 5,
      responseTime: '',
      hourlyRate: 0
    });
    setIsAddVendorModalOpen(false);
  };

  const handleUpdateVendor = (vendor: Vendor) => {
    setVendors(vendors.map(v => 
      v.id === vendor.id ? vendor : v
    ));
    setEditingVendor(null);
  };

  const handleDeleteVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const toggleSpecialization = (spec: string, current: string[], setter: (specs: string[]) => void) => {
    if (current.includes(spec)) {
      setter(current.filter(s => s !== spec));
    } else {
      setter([...current, spec]);
    }
  };

  const handleDepreciationSettingChange = (field: string, value: any) => {
    setDepreciationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLifespanChange = (category: string, value: number) => {
    setDepreciationSettings(prev => ({
      ...prev,
      defaultLifespan: {
        ...prev.defaultLifespan,
        [category]: value
      }
    }));
  };

  const handleCustomRateChange = (category: string, value: number) => {
    setDepreciationSettings(prev => ({
      ...prev,
      customRates: {
        ...prev.customRates,
        [category]: value
      }
    }));
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <p className="text-slate-300 mt-1">Configure system parameters and manage resources</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Configuration */}
        <div className="space-y-8">
          {/* Branches */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Branches</h2>
            </div>
            
            <form onSubmit={handleAddBranch} className="flex space-x-3 mb-4">
              <input
                type="text"
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                placeholder="Enter new branch..."
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {branches.map((branch, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 font-medium">{branch}</span>
                  </div>
                  <button
                    onClick={() => removeBranch(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Asset Categories</h2>
            </div>
            
            <form onSubmit={handleAddCategory} className="flex space-x-3 mb-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category..."
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 font-medium">{category}</span>
                  </div>
                  <button
                    onClick={() => removeCategory(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Depreciation Settings */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Depreciation Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Depreciation Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Depreciation Method</label>
                <div className="space-y-2">
                  {[
                    { value: 'straight-line', label: 'Straight Line', desc: 'Equal depreciation each year' },
                    { value: 'declining-balance', label: 'Declining Balance', desc: 'Higher depreciation in early years' },
                    { value: 'custom', label: 'Custom Rates', desc: 'Set custom annual rates per category' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value={method.value}
                        checked={depreciationSettings.method === method.value}
                        onChange={(e) => handleDepreciationSettingChange('method', e.target.value)}
                        className="mt-1 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <div className="font-medium text-slate-900">{method.label}</div>
                        <div className="text-sm text-slate-600">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salvage Value */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Salvage Value Percentage
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={depreciationSettings.salvageValuePercentage}
                    onChange={(e) => handleDepreciationSettingChange('salvageValuePercentage', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                    max="50"
                  />
                  <Percent className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">of original value retained</span>
                </div>
              </div>

              {/* Category-specific settings */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  {depreciationSettings.method === 'custom' ? 'Annual Depreciation Rates' : 'Asset Lifespan (Years)'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(depreciationSettings.defaultLifespan).map((category) => (
                    <div key={category} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{category}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={depreciationSettings.method === 'custom' 
                            ? depreciationSettings.customRates[category as keyof typeof depreciationSettings.customRates]
                            : depreciationSettings.defaultLifespan[category as keyof typeof depreciationSettings.defaultLifespan]
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (depreciationSettings.method === 'custom') {
                              handleCustomRateChange(category, value);
                            } else {
                              handleLifespanChange(category, value);
                            }
                          }}
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                          min="1"
                          max={depreciationSettings.method === 'custom' ? "100" : "20"}
                        />
                        <span className="text-xs text-slate-500">
                          {depreciationSettings.method === 'custom' ? '%' : 'yrs'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Depreciation Calculator Preview */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">Depreciation Preview</h4>
                </div>
                <div className="text-sm text-red-800">
                  <p>Method: <span className="font-medium capitalize">{depreciationSettings.method.replace('-', ' ')}</span></p>
                  <p>Salvage Value: <span className="font-medium">{depreciationSettings.salvageValuePercentage}%</span></p>
                  <p className="mt-2 text-xs">
                    Example: A $1,000 laptop will depreciate to ${Math.round(1000 * (1 - (depreciationSettings.customRates.Laptop / 100)) * 100) / 100} after 1 year
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="space-y-8">
          {/* Help Desk Employees */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Help Desk Team</h2>
              </div>
              <button
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {helpDeskEmployees.map((employee) => (
                <div key={employee.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          employee.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{employee.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Workload: {employee.workload}</span>
                        <span>Skills: {employee.specialization.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingEmployee(employee)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendors */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">External Vendors</h2>
              </div>
              <button
                onClick={() => setIsAddVendorModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-slate-600">{vendor.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{vendor.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{vendor.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{vendor.responseTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${vendor.hourlyRate}/hr</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Skills: {vendor.specialization.join(', ')}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingVendor(vendor)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">System Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Auto-assign Requests</p>
                    <p className="text-sm text-slate-600">Automatically assign maintenance requests</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.autoAssignRequests}
                    onChange={(e) => setSystemSettings({...systemSettings, autoAssignRequests: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-600">Send email alerts for important events</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.emailNotifications}
                    onChange={(e) => setSystemSettings({...systemSettings, emailNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Warranty Alerts</p>
                    <p className="text-sm text-slate-600">Alert when warranties are expiring</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.warrantyAlerts}
                    onChange={(e) => setSystemSettings({...systemSettings, warrantyAlerts: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Audit Frequency</label>
                  <select
                    value={systemSettings.auditFrequency}
                    onChange={(e) => setSystemSettings({...systemSettings, auditFrequency: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Default Warranty (months)</label>
                  <input
                    type="number"
                    value={systemSettings.defaultWarrantyPeriod}
                    onChange={(e) => setSystemSettings({...systemSettings, defaultWarrantyPeriod: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add Help Desk Employee</h2>
              <button
                onClick={() => setIsAddEmployeeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
                <div className="grid grid-cols-3 gap-2">
                  {specializations.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEmployee.specialization.includes(spec)}
                        onChange={() => toggleSpecialization(spec, newEmployee.specialization, (specs) => 
                          setNewEmployee({...newEmployee, specialization: specs})
                        )}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEmployee.available}
                    onChange={(e) => setNewEmployee({...newEmployee, available: e.target.checked})}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Available for assignments</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors duration-200"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add External Vendor</h2>
              <button
                onClick={() => setIsAddVendorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddVendor} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
                <div className="grid grid-cols-3 gap-2">
                  {specializations.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVendor.specialization.includes(spec)}
                        onChange={() => toggleSpecialization(spec, newVendor.specialization, (specs) => 
                          setNewVendor({...newVendor, specialization: specs})
                        )}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <select
                    value={newVendor.rating}
                    onChange={(e) => setNewVendor({...newVendor, rating: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4.5}>4.5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3.5}>3.5 Stars</option>
                    <option value={3}>3 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Response Time</label>
                  <input
                    type="text"
                    value={newVendor.responseTime}
                    onChange={(e) => setNewVendor({...newVendor, responseTime: e.target.value})}
                    placeholder="e.g., 2-4 hours"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={newVendor.hourlyRate}
                    onChange={(e) => setNewVendor({...newVendor, hourlyRate: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}