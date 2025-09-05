import { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Filter, 
  Download,
  Settings,
  Eye,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: ReportField[];
  chartTypes: string[];
}

interface ReportBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ReportTemplate) => void;
}

export default function ReportBuilder({ isOpen, onClose, onSave }: ReportBuilderProps) {
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    category: 'asset',
    fields: [],
    chartTypes: []
  });

  const [newField, setNewField] = useState<Partial<ReportField>>({
    name: '',
    type: 'text',
    required: false
  });

  const availableFields: ReportField[] = [
    { id: 'asset-name', name: 'Asset Name', type: 'text', required: true },
    { id: 'asset-id', name: 'Asset ID', type: 'text', required: true },
    { id: 'category', name: 'Category', type: 'select', required: false, options: ['Laptop', 'Monitor', 'Mobile', 'Tablet', 'Desktop'] },
    { id: 'status', name: 'Status', type: 'select', required: false, options: ['Active', 'Inactive', 'Under Maintenance', 'Retired'] },
    { id: 'branch', name: 'Branch', type: 'select', required: false, options: ['New York', 'San Francisco', 'Austin', 'Seattle'] },
    { id: 'purchase-date', name: 'Purchase Date', type: 'date', required: false },
    { id: 'current-value', name: 'Current Value', type: 'number', required: false },
    { id: 'condition', name: 'Condition', type: 'select', required: false, options: ['Excellent', 'Good', 'Fair', 'Poor'] }
  ];

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'pie', name: 'Pie Chart', icon: PieChart },
    { id: 'line', name: 'Line Chart', icon: BarChart3 }
  ];

  const handleAddField = (field: ReportField) => {
    if (!template.fields?.find(f => f.id === field.id)) {
      setTemplate(prev => ({
        ...prev,
        fields: [...(prev.fields || []), field]
      }));
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields?.filter(f => f.id !== fieldId) || []
    }));
  };

  const handleToggleChart = (chartType: string) => {
    setTemplate(prev => ({
      ...prev,
      chartTypes: prev.chartTypes?.includes(chartType)
        ? prev.chartTypes.filter(c => c !== chartType)
        : [...(prev.chartTypes || []), chartType]
    }));
  };

  const handleSave = () => {
    if (template.name && template.fields && template.fields.length > 0) {
      const completeTemplate: ReportTemplate = {
        id: `template-${Date.now()}`,
        name: template.name,
        description: template.description || '',
        category: template.category || 'asset',
        fields: template.fields,
        chartTypes: template.chartTypes || []
      };
      onSave(completeTemplate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Report Builder</h2>
                <p className="text-indigo-100">Create custom report templates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Configuration */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Template Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => setTemplate({...template, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter template name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={template.description}
                      onChange={(e) => setTemplate({...template, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Describe what this report will contain..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select
                      value={template.category}
                      onChange={(e) => setTemplate({...template, category: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="asset">Asset Reports</option>
                      <option value="maintenance">Maintenance Reports</option>
                      <option value="financial">Financial Reports</option>
                      <option value="compliance">Compliance Reports</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Available Fields */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Fields</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{field.name}</p>
                        <p className="text-sm text-slate-600 capitalize">{field.type}</p>
                      </div>
                      <button
                        onClick={() => handleAddField(field)}
                        disabled={template.fields?.some(f => f.id === field.id)}
                        className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Preview */}
            <div className="space-y-6">
              {/* Selected Fields */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Fields</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {template.fields?.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                      <p>No fields selected</p>
                      <p className="text-sm">Add fields from the left panel</p>
                    </div>
                  ) : (
                    template.fields?.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{field.name}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-slate-600 capitalize">{field.type}</span>
                            {field.required && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveField(field.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chart Types */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Chart Types</h3>
                <div className="grid grid-cols-1 gap-3">
                  {chartTypes.map((chart) => {
                    const IconComponent = chart.icon;
                    const isSelected = template.chartTypes?.includes(chart.id);
                    
                    return (
                      <button
                        key={chart.id}
                        onClick={() => handleToggleChart(chart.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {chart.name}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Template Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fields:</span>
                    <span className="font-medium text-slate-900">{template.fields?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Charts:</span>
                    <span className="font-medium text-slate-900">{template.chartTypes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium text-slate-900 capitalize">{template.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!template.name || !template.fields?.length}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-200"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}