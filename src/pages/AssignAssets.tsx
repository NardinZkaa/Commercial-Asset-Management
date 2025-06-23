import { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Plus, 
  User, 
  Package, 
  MapPin,
  Mail,
  Building,
  Download,
  X,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockUsers, mockAssets } from '../data/mockData';
import { User as UserType, Asset, AssetAssignment, HandoverForm } from '../types';
import FileUpload from './FileUpload';

export default function AssignAssets() {
  const [users, setUsers] = useState<UserType[]>(mockUsers);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [handoverForms, setHandoverForms] = useState<HandoverForm[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedAssignmentForUpload, setSelectedAssignmentForUpload] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({ userId: '', assetId: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [assetToAssign, setAssetToAssign] = useState<string | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getUserAssignments = (userId: string) => {
    return assignments.filter(assignment => assignment.userId === userId);
  };

  const getAssetById = (assetId: string) => {
    return assets.find(asset => asset.id === assetId);
  };

  const getHandoverFormByAssignment = (assignmentId: string) => {
    return handoverForms.find(form => 
      assignments.find(a => a.id === assignmentId)?.assetId === form.assetId &&
      assignments.find(a => a.id === assignmentId)?.userId === form.userId
    );
  };

  const getUnassignedAssets = () => {
    const assignedAssetIds = assignments.map(a => a.assetId);
    return assets.filter(asset => !assignedAssetIds.includes(asset.id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'returned': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'returned': return <Package className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAssignAsset = (assetId: string) => {
    setAssetToAssign(assetId);
    setIsConfirmModalOpen(true);
  };

  const confirmAssignAsset = () => {
    if (selectedUser && assetToAssign) {
      const newAssignmentId = `assign-${Date.now()}`;
      const newAssignmentObj: AssetAssignment = {
        id: newAssignmentId,
        assetId: assetToAssign,
        userId: selectedUser.id,
        assignedDate: new Date().toISOString(),
        status: 'pending'
      };
      setAssignments([...assignments, newAssignmentObj]);
    }
    setIsConfirmModalOpen(false);
    setAssetToAssign(null);
  };

  const cancelAssignAsset = () => {
    setIsConfirmModalOpen(false);
    setAssetToAssign(null);
  };

  const handleRemoveAsset = (assignmentId: string) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
    // Also remove associated handover form
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setHandoverForms(handoverForms.filter(f => 
        !(f.assetId === assignment.assetId && f.userId === assignment.userId)
      ));
    }
  };

  const handleUploadHandoverForm = (assignmentId: string) => {
    setSelectedAssignmentForUpload(assignmentId);
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = (file: File) => {
    if (selectedAssignmentForUpload) {
      const assignment = assignments.find(a => a.id === selectedAssignmentForUpload);
      if (assignment) {
        const newHandoverForm: HandoverForm = {
          id: `form-${Date.now()}`,
          assetId: assignment.assetId,
          userId: assignment.userId,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // In a real app, this would be uploaded to a server
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          signed: false
        };
        
        setHandoverForms([...handoverForms, newHandoverForm]);
        
        // Update assignment status
        setAssignments(assignments.map(a => 
          a.id === selectedAssignmentForUpload 
            ? { ...a, status: 'signed' as const }
            : a
        ));
        
        setIsUploadModalOpen(false);
        setSelectedAssignmentForUpload(null);
      }
    }
  };

  const downloadHandoverForm = (form: HandoverForm) => {
    const link = document.createElement('a');
    link.href = form.fileUrl;
    link.download = form.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAssetPDF = (asset: Asset, user: UserType) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Header with gradient
    doc.setFillColor(51, 51, 51);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Asset Assignment Report', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 35, { align: 'center' });

    // Logo Placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 10, 30, 20, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Logo', 35, 20, { align: 'center' });

    // Asset Details Table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Asset Details', 20, 60);
    autoTable(doc, {
      startY: 70,
      head: [['Field', 'Value']],
      body: [
        ['ID', asset.id],
        ['Name', asset.name],
        ['Category', asset.category],
        ['Status', asset.status],
        ['Serial Number', asset.serialNumber],
        ['Location', asset.location],
        ['Branch', asset.branch],
        ['Purchase Date', new Date(asset.purchaseDate).toLocaleDateString()],
        ['Purchase Price', `$${asset.purchasePrice.toLocaleString()}`],
        ['Current Value', `$${asset.currentValue.toLocaleString()}`],
        ['Condition', asset.condition],
        ['Vendor', asset.vendor],
        ['Warranty', asset.warranty || 'N/A'],
        ['Description', asset.description],
        ['Next Audit Date', asset.nextAuditDate ? new Date(asset.nextAuditDate).toLocaleDateString() : 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 102, 204], textColor: 255 },
      bodyStyles: { fillColor: 255, textColor: 0 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });

    // Employee Details Table
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.setFontSize(16);
    doc.text('Assigned Employee Details', 20, finalY + 20);
    autoTable(doc, {
      startY: finalY + 30,
      head: [['Field', 'Value']],
      body: [
        ['Name', user.name],
        ['Email', user.email],
        ['Department', user.department],
        ['Role', user.role],
        ['Branch', user.branch],
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 102, 204], textColor: 255 },
      bodyStyles: { fillColor: 255, textColor: 0 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });

    doc.save(`Asset_${asset.id}_Assignment.pdf`);
  };

  const handleNewAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === newAssignment.userId);
    const asset = assets.find(a => a.id === newAssignment.assetId);
    if (user && asset && !assignments.find(a => a.assetId === asset.id)) {
      const newAssignmentObj: AssetAssignment = {
        id: `assign-${Date.now()}`,
        assetId: asset.id,
        userId: user.id,
        assignedDate: new Date().toISOString(),
        status: 'pending'
      };
      setAssignments([...assignments, newAssignmentObj]);
      setIsManageModalOpen(false);
      setNewAssignment({ userId: '', assetId: '' });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Asset Assignment & Handover</h1>
              <p className="text-slate-300 mt-1">Manage asset assignments and track handover forms</p>
            </div>
          </div>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
              <p className="text-sm font-medium text-slate-600">Active Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {assignments.filter(a => a.status === 'signed').length}
              </p>
              <p className="text-sm font-medium text-slate-600">Forms Signed</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {assignments.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-sm font-medium text-slate-600">Pending Forms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-2">
          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

          {/* Users Grid */}
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const userAssignments = getUserAssignments(user.id);
              return (
                <div
                  key={user.id}
                  className={`bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${
                    selectedUser?.id === user.id ? 'ring-2 ring-blue-500 border-blue-300' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-slate-600">
                            <Building className="w-4 h-4" />
                            <span>{user.department}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{user.branch}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{userAssignments.length}</p>
                        <p className="text-xs text-slate-600">Assets</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Assignment Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl sticky top-8">
            {selectedUser ? (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-600">{selectedUser.department}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assigned Assets ({getUserAssignments(selectedUser.id).length})
                    </label>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {getUserAssignments(selectedUser.id).map((assignment) => {
                        const asset = getAssetById(assignment.assetId);
                        const handoverForm = getHandoverFormByAssignment(assignment.id);
                        if (!asset) return null;
                        
                        return (
                          <div key={assignment.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{asset.name}</p>
                                <p className="text-xs text-slate-600">{asset.id}</p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                                {getStatusIcon(assignment.status)}
                                <span className="ml-1 capitalize">{assignment.status}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => generateAssetPDF(asset, selectedUser)}
                                  className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Report
                                </button>
                                {handoverForm ? (
                                  <button
                                    onClick={() => downloadHandoverForm(handoverForm)}
                                    className="text-green-600 hover:text-green-700 text-xs flex items-center"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    Form
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUploadHandoverForm(assignment.id)}
                                    className="text-amber-600 hover:text-amber-700 text-xs flex items-center"
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    Upload
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveAsset(assignment.id)}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {getUserAssignments(selectedUser.id).length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No assets assigned</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Available Assets ({getUnassignedAssets().length})
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getUnassignedAssets().slice(0, 5).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{asset.name}</p>
                            <p className="text-xs text-slate-600">{asset.id}</p>
                          </div>
                          <button
                            onClick={() => handleAssignAsset(asset.id)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                      {getUnassignedAssets().length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No available assets</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors duration-200"
                >
                  Manage Assignments
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a User</h3>
                <p className="text-slate-600">Choose a user to view and manage their asset assignments.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Handover Form Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Upload Handover Form</h2>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedAssignmentForUpload(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".pdf,.doc,.docx"
                maxSize={10}
              />
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Upload the signed handover form for this asset</li>
                <li>• Accepted formats: PDF, DOC, DOCX</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Form will be linked to this specific assignment</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Manage Assignments Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Assignment</h2>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleNewAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                <select
                  name="userId"
                  value={newAssignment.userId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, userId: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset</label>
                <select
                  name="assetId"
                  value={newAssignment.assetId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, assetId: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Asset</option>
                  {getUnassignedAssets().map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Assignment</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to assign this asset to {selectedUser?.name}?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelAssignAsset}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                No
              </button>
              <button
                onClick={confirmAssignAsset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}