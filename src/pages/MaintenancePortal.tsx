import { useState } from 'react';
import { 
  Wrench, 
  Send, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Package,
  FileText,
  Camera,
  Paperclip
} from 'lucide-react';
import { mockAssets, mockUsers } from '../data/mockMainData';
import { Asset, User as UserType } from '../types';

interface MaintenanceTicket {
  assetId: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'hardware' | 'software' | 'network' | 'other';
  attachments: File[];
}

export default function MaintenancePortal() {
  const [assets] = useState<Asset[]>(mockAssets);
  const [users] = useState<UserType[]>(mockUsers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticket, setTicket] = useState<MaintenanceTicket>({
    assetId: '',
    userId: '1', // Default to first user (Sarah Johnson)
    title: '',
    description: '',
    priority: 'medium',
    category: 'hardware',
    attachments: []
  });

  const currentUser = users.find(u => u.id === ticket.userId) || users[0];

  const handleInputChange = (field: keyof MaintenanceTicket, value: any) => {
    setTicket(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTicket(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files].slice(0, 5) // Max 5 files
    }));
  };

  const removeAttachment = (index: number) => {
    setTicket(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form
    setTicket({
      assetId: '',
      userId: currentUser.id,
      title: '',
      description: '',
      priority: 'medium',
      category: 'hardware',
      attachments: []
    });

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 text-red-700';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'medium': return 'border-amber-500 bg-amber-50 text-amber-700';
      case 'low': return 'border-emerald-500 bg-emerald-50 text-emerald-700';
      default: return 'border-slate-500 bg-slate-50 text-slate-700';
    }
  };

  const selectedAsset = assets.find(a => a.id === ticket.assetId);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Maintenance Portal</h1>
              <p className="text-blue-200 text-lg">Submit maintenance requests for your assets</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Welcome, {currentUser.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>{currentUser.department}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">Request Submitted Successfully!</h3>
              <p className="text-emerald-700">Your maintenance request has been submitted and will be reviewed by the management team.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Maintenance Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Asset *
                </label>
                <select
                  value={ticket.assetId}
                  onChange={(e) => handleInputChange('assetId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                >
                  <option value="">Choose an asset...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id}) - {asset.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={ticket.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Brief description of the issue..."
                  required
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  >
                    <option value="low">Low - Can wait</option>
                    <option value="medium">Medium - Normal priority</option>
                    <option value="high">High - Important</option>
                    <option value="urgent">Urgent - Critical issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={ticket.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  >
                    <option value="hardware">Hardware Issue</option>
                    <option value="software">Software Problem</option>
                    <option value="network">Network/Connectivity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={ticket.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Please provide detailed information about the issue, including:
• What happened?
• When did it start?
• What were you doing when it occurred?
• Any error messages?
• Steps you've already tried..."
                  required
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium">Click to upload files</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Images, PDFs, documents (max 5 files, 10MB each)
                    </p>
                  </label>
                </div>

                {/* Attachment List */}
                {ticket.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {ticket.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">{file.name}</span>
                          <span className="text-xs text-slate-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTicket({
                    assetId: '',
                    userId: currentUser.id,
                    title: '',
                    description: '',
                    priority: 'medium',
                    category: 'hardware',
                    attachments: []
                  })}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 font-medium flex items-center space-x-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Asset Info */}
          {selectedAsset && (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Asset</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-slate-900">{selectedAsset.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Category</p>
                  <p className="text-slate-900">{selectedAsset.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Location</p>
                  <p className="text-slate-900">{selectedAsset.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Serial Number</p>
                  <p className="text-slate-900">{selectedAsset.serialNumber}</p>
                </div>
                {selectedAsset.warranty && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Warranty</p>
                    <p className="text-slate-900">{selectedAsset.warranty}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Priority Guide */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Priority Guidelines</h3>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border-2 ${getPriorityColor('urgent')}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">Urgent</span>
                </div>
                <p className="text-xs">System down, security breach, or safety issue</p>
              </div>
              
              <div className={`p-3 rounded-lg border-2 ${getPriorityColor('high')}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">High</span>
                </div>
                <p className="text-xs">Significant impact on productivity</p>
              </div>
              
              <div className={`p-3 rounded-lg border-2 ${getPriorityColor('medium')}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">Medium</span>
                </div>
                <p className="text-xs">Normal business impact</p>
              </div>
              
              <div className={`p-3 rounded-lg border-2 ${getPriorityColor('low')}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold">Low</span>
                </div>
                <p className="text-xs">Minor issue, can wait for scheduled maintenance</p>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Need Help?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Knowledge Base</p>
                  <p className="text-slate-600">Check our FAQ and troubleshooting guides</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Contact IT Support</p>
                  <p className="text-slate-600">Call ext. 1234 for immediate assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}