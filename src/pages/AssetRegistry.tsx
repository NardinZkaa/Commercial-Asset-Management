import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  X
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Papa from 'papaparse';
import { mockAssets } from '../data/mockData';
import { Asset } from '../types';

export default function AssetRegistry() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    category: 'Electronics',
    status: 'Active',
    branch: 'Main Branch',
    serialNumber: '',
    location: '',
    assignedTo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    currentValue: 0,
    condition: 'Good',
    vendor: '',
    description: '',
    warranty: '',
    poNumber: '', // Added PO number field
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Inactive': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Under Maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Retired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'text-emerald-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-amber-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const asset: Asset = {
      ...newAsset,
      id: `AST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      nextAuditDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    } as Asset;
    setAssets([...assets, asset]);
    setIsAddModalOpen(false);
    setNewAsset({
      name: '',
      category: 'Electronics',
      status: 'Active',
      branch: 'Main Branch',
      serialNumber: '',
      location: '',
      assignedTo: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      currentValue: 0,
      condition: 'Good',
      vendor: '',
      description: '',
      warranty: '',
      poNumber: '', // Reset PO number field
    });
  };

  const handleEditAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      setAssets(assets.map(asset => 
        asset.id === selectedAsset.id ? { ...selectedAsset, ...newAsset } : asset
      ));
      setIsEditModalOpen(false);
      setSelectedAsset(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleExport = () => {
    const csvData = filteredAssets.map(asset => ({
      ID: asset.id,
      Name: asset.name,
      Category: asset.category,
      Status: asset.status,
      Branch: asset.branch,
      SerialNumber: asset.serialNumber,
      Location: asset.location,
      AssignedTo: asset.assignedTo || 'Unassigned',
      PurchaseDate: new Date(asset.purchaseDate).toLocaleDateString(),
      PurchasePrice: asset.purchasePrice,
      CurrentValue: asset.currentValue,
      Condition: asset.condition,
      Vendor: asset.vendor,
      Description: asset.description,
      Warranty: asset.warranty || 'N/A',
      LastAuditDate: asset.lastAuditDate ? new Date(asset.lastAuditDate).toLocaleDateString() : 'N/A',
      NextAuditDate: asset.nextAuditDate ? new Date(asset.nextAuditDate).toLocaleDateString() : 'N/A',
      PONumber: asset.poNumber || 'N/A', // Added PO number to export
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'assets_export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const renderAssetForm = (isEdit: boolean) => (
    <form onSubmit={isEdit ? handleEditAsset : handleAddAsset} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
          <input
            type="text"
            name="name"
            value={newAsset.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
          <input
            type="text"
            name="serialNumber"
            value={newAsset.serialNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            name="category"
            value={newAsset.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Equipment">Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            name="status"
            value={newAsset.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
          <select
            name="branch"
            value={newAsset.branch}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Main Branch">Main Branch</option>
            <option value="North Branch">North Branch</option>
            <option value="East Branch">East Branch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={newAsset.location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
          <input
            type="text"
            name="assignedTo"
            value={newAsset.assignedTo}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
          <input
            type="date"
            name="purchaseDate"
            value={newAsset.purchaseDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {/* Added PO Number field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">PO Number</label>
          <input
            type="text"
            name="poNumber"
            value={newAsset.poNumber || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
          <input
            type="number"
            name="purchasePrice"
            value={newAsset.purchasePrice}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current Value</label>
          <input
            type="number"
            name="currentValue"
            value={newAsset.currentValue}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
          <select
            name="condition"
            value={newAsset.condition}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
          <input
            type="text"
            name="vendor"
            value={newAsset.vendor}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Warranty</label>
          <input
            type="text"
            name="warranty"
            value={newAsset.warranty}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          name="description"
          value={newAsset.description}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={() => isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false)}
          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          {isEdit ? 'Save Changes' : 'Add Asset'}
        </button>
      </div>
    </form>
  );

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Asset Registry</h1>
              <p className="text-slate-300 mt-1">Manage and track all organizational assets</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets by name or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Equipment">Equipment</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={handleExport}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              {/* Added PO Number column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">QR Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{asset.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{asset.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{asset.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{asset.location}</td>
                {/* Added PO Number cell */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{asset.poNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${asset.currentValue.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ${getConditionColor(asset.condition)}">{asset.condition}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <QRCodeCanvas value={asset.id} size={60} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(asset)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Asset Details</h2>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                  <p className="text-slate-900 font-medium">{selectedAsset.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Asset ID</label>
                  <p className="text-slate-900">{selectedAsset.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <p className="text-slate-900">{selectedAsset.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAsset.status)}`}>
                    {selectedAsset.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                  <p className="text-slate-900">{selectedAsset.serialNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <p className="text-slate-900">{selectedAsset.location}</p>
                </div>
                {/* Added PO Number in details */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PO Number</label>
                  <p className="text-slate-900">{selectedAsset.poNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                  <p className="text-slate-900">{selectedAsset.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                  <p className="text-slate-900">{new Date(selectedAsset.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
                  <p className="text-slate-900">${selectedAsset.purchasePrice.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Value</label>
                  <p className="text-slate-900">${selectedAsset.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                  <p className={`font-medium ${getConditionColor(selectedAsset.condition)}`}>
                    {selectedAsset.condition}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                  <p className="text-slate-900">{selectedAsset.vendor}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Warranty</label>
                  <p className="text-slate-900">{selectedAsset.warranty || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <p className="text-slate-900">{selectedAsset.description}</p>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">QR Code</label>
              <QRCodeCanvas value={selectedAsset.id} size={150} className="mt-2" />
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => openEditModal(selectedAsset)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Edit Asset
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add New Asset</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {renderAssetForm(false)}
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Edit Asset</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {renderAssetForm(true)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No assets found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or add a new asset.</p>
        </div>
      )}
    </>
  );
}