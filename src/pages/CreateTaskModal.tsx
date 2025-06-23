import { useState } from 'react';
import { X, Plus, Calendar, User, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { AuditTask, CreateTaskForm } from '../types';
import { mockUsers } from '../data/mockData';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: AuditTask) => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskForm>({
    assetName: '',
    type: 'IT Assets',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CreateTaskForm>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<CreateTaskForm> = {};
    if (!formData.assetName.trim()) newErrors.assetName = 'Asset name is required';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'Assignee is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create new task
    const newTask: AuditTask = {
      id: Date.now().toString(),
      assetName: formData.assetName,
      type: formData.type,
      status: 'Pending',
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      notes: formData.notes,
      checklist: [],
      missingAssets: []
    };

    onSubmit(newTask);
    
    // Reset form
    setFormData({
      assetName: '',
      type: 'IT Assets',
      priority: 'Medium',
      assignedTo: '',
      dueDate: '',
      notes: ''
    });
    setErrors({});
  };

  const handleChange = (field: keyof CreateTaskForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Create New Audit Task</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Asset Name *
            </label>
            <input
              type="text"
              value={formData.assetName}
              onChange={(e) => handleChange('assetName', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                errors.assetName ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
              }`}
              placeholder="Enter asset name or description"
            />
            {errors.assetName && (
              <p className="text-red-600 text-sm mt-1">{errors.assetName}</p>
            )}
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <ClipboardCheck className="w-4 h-4 inline mr-1" />
                Audit Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as CreateTaskForm['type'])}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="IT Assets">IT Assets</option>
                <option value="Security">Security</option>
                <option value="Financial">Financial</option>
                <option value="Compliance">Compliance</option>
                <option value="Inventory">Inventory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as CreateTaskForm['priority'])}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Assigned To and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Assigned To *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.assignedTo ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select assignee</option>
                {mockUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-red-600 text-sm mt-1">{errors.assignedTo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.dueDate ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Add any additional notes or requirements..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}