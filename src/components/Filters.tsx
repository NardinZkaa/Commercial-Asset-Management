import { ChevronDown, Filter } from 'lucide-react';
import { FilterType, BranchType, StatusType } from '../types/dashboard';

interface FiltersProps {
  category: FilterType;
  branch: BranchType;
  status: StatusType;
  onCategoryChange: (category: FilterType) => void;
  onBranchChange: (branch: BranchType) => void;
  onStatusChange: (status: StatusType) => void;
}

export default function Filters({
  category,
  branch,
  status,
  onCategoryChange,
  onBranchChange,
  onStatusChange
}: FiltersProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700">
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as FilterType)}
              className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicles">Vehicles</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Branch Filter */}
        <div className="space-y-2">
          <label htmlFor="branch" className="block text-sm font-semibold text-slate-700">
            Branch
          </label>
          <div className="relative">
            <select
              id="branch"
              value={branch}
              onChange={(e) => onBranchChange(e.target.value as BranchType)}
              className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
            >
              <option value="all">All Branches</option>
              <option value="Main Branch">Main Branch</option>
              <option value="North Branch">North Branch</option>
              <option value="East Branch">East Branch</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-semibold text-slate-700">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as StatusType)}
              className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}