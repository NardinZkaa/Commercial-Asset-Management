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
import { jsPDF } from 'jspdf';
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
  const [newAssignment, setNewAssignment] = useState({ userId: '', assetId: '', returnDate: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [assetToAssign, setAssetToAssign] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState<string>(''); // New state for return date

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
    // No immediate confirmation modal; show return date input instead
  };

  const confirmAssignAsset = () => {
    if (selectedUser && assetToAssign) {
      const newAssignmentId = `assign-${Date.now()}`;
      const newAssignmentObj: AssetAssignment = {
        id: newAssignmentId,
        assetId: assetToAssign,
        userId: selectedUser.id,
        assignedDate: new Date().toISOString(),
        returnDate: returnDate || undefined, // Use the return date from state
        status: 'pending'
      };
      setAssignments([...assignments, newAssignmentObj]);
    }
    setIsConfirmModalOpen(false);
    setAssetToAssign(null);
    setReturnDate(''); // Reset return date after assignment
  };

  const cancelAssignAsset = () => {
    setIsConfirmModalOpen(false);
    setAssetToAssign(null);
    setReturnDate(''); // Reset return date if canceled
  };

  const handleRemoveAsset = (assignmentId: string) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
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
    if (file && selectedAssignmentForUpload) {
      const assignment = assignments.find(a => a.id === selectedAssignmentForUpload);
      if (assignment) {
        const newHandoverForm: HandoverForm = {
          id: `form-${Date.now()}`,
          assetId: assignment.assetId,
          userId: assignment.userId,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          signed: true
        };
        
        setHandoverForms([...handoverForms, newHandoverForm]);
        
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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPos = margin;

    // Header with gradient background
    doc.setFillColor(51, 102, 204);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company Name
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('TechCorp Asset Management', pageWidth / 2, 15, { align: 'center' });
    
    // Form Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Asset Handover Certificate', pageWidth / 2, 30, { align: 'center' });
    doc.setFont(undefined, 'normal');
    
    yPos = 50;

    // Document Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    const today = new Date();
    doc.text(`Document ID: HC-${today.getFullYear()}${String(today.getMonth()+1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${asset.id.slice(-6)}`, margin, yPos);
    doc.text(`Generated on: ${today.toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // ======== RENDER TABLE FUNCTION ========
    const renderDetailsSection = (title: string, data: [string, string][]) => {
      // Section title
      doc.setFontSize(14);
      doc.setTextColor(51, 102, 204);
      doc.text(title, margin, yPos);
      yPos += 10;
      
      // Header background
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      
      // Header text
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Property', margin + 5, yPos + 6);
      doc.text('Value', margin + (pageWidth - 2 * margin) * 0.4 + 5, yPos + 6);
      
      const startY = yPos; // Store the starting Y position of the table
      yPos += 10;
      
      // Rows
      doc.setFontSize(10);
      doc.setTextColor(0);
      
      for (const [property, value] of data) {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(property + ':', margin + 5, yPos + 7);
        const lines = doc.splitTextToSize(value, (pageWidth - 2 * margin) * 0.6 - 10);
        const cellHeight = Math.max(lines.length * lineHeight, 10);
        doc.text(lines, margin + (pageWidth - 2 * margin) * 0.4 + 5, yPos + 7);
        
        doc.setDrawColor(220);
        doc.line(margin, yPos + cellHeight, pageWidth - margin, yPos + cellHeight); // Internal row separator
        
        yPos += cellHeight;
      }
      
      // No outer borders - only internal separators
      yPos += 10;
    };

    // ======== ASSET DETAILS SECTION ========
    const assetDetails: [string, string][] = [
      ['Asset ID', asset.id],
      ['Asset Name', asset.name],
      ['Category', asset.category],
      ['Serial Number', asset.serialNumber],
      ['Location', asset.location],
      ['Branch', asset.branch],
      ['Condition', asset.condition],
      ['Purchase Date', new Date(asset.purchaseDate).toLocaleDateString()],
      ['Current Value', `$${asset.currentValue.toLocaleString()}`],
      ['Warranty Status', asset.warranty || 'No warranty'],
      ['Description', asset.description || 'No description provided']
    ];
    
    renderDetailsSection('Asset Information', assetDetails);
    
    // ======== EMPLOYEE DETAILS SECTION ========
    const employeeDetails: [string, string][] = [
      ['Employee ID', user.id],
      ['Full Name', user.name],
      ['Email', user.email],
      ['Department', user.department],
      ['Position', user.role],
      ['Branch', user.branch],
      ['Contact', user.phone || 'N/A'],
      ['Hire Date', user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A']
    ];
    
    renderDetailsSection('Employee Information', employeeDetails);
    
    // ======== ASSIGNMENT DETAILS SECTION ========
    const assignment = assignments.find(a => a.assetId === asset.id && a.userId === user.id);
    const assignmentDetails: [string, string][] = [
      ['Assignment Date', new Date(assignment?.assignedDate || today).toLocaleDateString()],
      ['Expected Return Date', assignment?.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : 'Not set']
    ];
    
    renderDetailsSection('Assignment Details', assignmentDetails);

    // ======== TERMS AND CONDITIONS SECTION ========
    doc.setFontSize(14);
    doc.setTextColor(51, 102, 204);
    doc.text('Terms and Conditions', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    const terms = [
      '1. The undersigned acknowledge that the above asset is being handed over in good working condition.',
      '2. The assignee agrees to:',
      '   a. Use the asset solely for business purposes',
      '   b. Maintain the asset in good condition',
      '   c. Report any damage or malfunction immediately',
      '   d. Not modify or alter the asset without authorization',
      '3. Any loss or damage due to negligence may result in financial responsibility.',
      '4. The asset must be returned upon termination of employment or department transfer.',
      '5. All company assets remain property of TechCorp at all times.'
    ];

    for (const term of terms) {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      
      const lines = doc.splitTextToSize(term, pageWidth - 2 * margin);
      doc.text(lines, margin, yPos);
      yPos += lines.length * lineHeight + 2;
    }

    yPos += 10;

    // ======== SIGNATURE SECTION ========
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setTextColor(51, 102, 204);
    doc.text('Signatures', margin, yPos);
    yPos += 15;

    // Signature fields with proper spacing
    const sigY = yPos;
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    // Asset Manager
    doc.text('Asset Manager:', margin, sigY);
    doc.line(margin, sigY + 5, margin + 80, sigY + 5);
    doc.text('Name: ____________________', margin, sigY + 15);
    doc.text(`Date: ${today.toLocaleDateString()}`, margin, sigY + 25);
    
    // Employee
    doc.text('Employee:', pageWidth - 100, sigY);
    doc.line(pageWidth - 100, sigY + 5, pageWidth - margin, sigY + 5);
    doc.text(`Name: ${user.name}`, pageWidth - 100, sigY + 15);
    doc.text(`Date: ${today.toLocaleDateString()}`, pageWidth - 100, sigY + 25);
    
    // Witness
    doc.text('Witness:', pageWidth / 2 - 40, sigY + 40);
    doc.line(pageWidth / 2 - 40, sigY + 45, pageWidth / 2 + 40, sigY + 45);
    doc.text('Name: ____________________', pageWidth / 2 - 40, sigY + 55);
    doc.text(`Date: ${today.toLocaleDateString()}`, pageWidth / 2 - 40, sigY + 65);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Confidential Document - TechCorp Internal Use Only', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Watermark
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text('HANDOVER CERTIFICATE', pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center'
    });
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Save the PDF
    doc.save(`${asset.id}_${user.id}_Handover_Certificate.pdf`);
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
        returnDate: newAssignment.returnDate || undefined, // Optional return date
        status: 'pending'
      };
      setAssignments([...assignments, newAssignmentObj]);
      setIsManageModalOpen(false);
      setNewAssignment({ userId: '', assetId: '', returnDate: '' });
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

                  {/* Return Date Input (shown when asset is selected for assignment) */}
                  {assetToAssign && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Expected Return Date (Optional)</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end mt-2 space-x-4">
                        <button
                          onClick={() => setAssetToAssign(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setIsConfirmModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          disabled={!selectedUser}
                        >
                          Confirm Assignment
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* New Assignment Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Assignment</h2>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-200"
                onClick={() => setIsManageModalOpen(false)}
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Return Date (Optional)</label>
                <input
                  type="date"
                  value={newAssignment.returnDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, returnDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && assetToAssign && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Assignment</h2>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to assign the asset "{getAssetById(assetToAssign)?.name}" to {selectedUser.name}?
              {returnDate && <span className="block mt-2">Expected Return Date: {new Date(returnDate).toLocaleDateString()}</span>}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                onClick={cancelAssignAsset}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={confirmAssignAsset}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}