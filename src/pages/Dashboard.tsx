import { BarChart3, PieChart, Users, Clock, Package, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Activity, Zap, Shield, ClipboardCheck, Wrench, Star, Target } from 'lucide-react';
import { ChartConfiguration } from 'chart.js/auto';

import Filters from '../components/Filters';
import LifecycleMetrics from '../components/LifecycleMetrics';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { useFilteredData } from '../hooks/useFilteredData';
import { FilterType, BranchType, StatusType } from '../types/dashboard';
import { mockMetrics } from '../data/mockData';
import { useState } from 'react';

export default function Dashboard() {
  const [category, setCategory] = useState<FilterType>('all');
  const [branch, setBranch] = useState<BranchType>('all');
  const [status, setStatus] = useState<StatusType>('all');

  const filteredData = useFilteredData(category, branch, status);

  // Chart configurations
  const assetStateConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: filteredData.assetStatus.map(item => item.status),
      datasets: [{
        data: filteredData.assetStatus.map(item => item.count),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: { size: 12, weight: '500' }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  };

  const ownershipChangesConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: filteredData.ownershipChanges.map(item => item.branch),
      datasets: [{
        label: 'Ownership Changes',
        data: filteredData.ownershipChanges.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 12 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  };

  const depreciationConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [
        {
          label: 'Electronics',
          data: [100, 75, 55, 40, 25],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Furniture',
          data: [100, 85, 70, 60, 50],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Vehicles',
          data: [100, 70, 50, 35, 25],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: '#e2e8f0' },
          ticks: { 
            font: { size: 12 },
            callback: function(value) {
              return value + '%';
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: { size: 12, weight: '500' }
          }
        }
      }
    }
  };

  const maintenanceCostConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Maintenance Costs ($)',
        data: [8200, 12500, 9800, 15200, 11300, 7900, 13400, 10600, 9200, 14100, 12800, 11500],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 12 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  };

  return (
    <>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">AssetFlow Enterprise</h1>
                <p className="text-blue-200 text-lg">Comprehensive Asset Management Dashboard</p>
                <div className="flex items-center space-x-6 mt-3 text-sm text-blue-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>System Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Connection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Real-time Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white/80 text-sm mb-1">Last Updated</div>
              <div className="text-white font-semibold">{new Date().toLocaleString()}</div>
              <div className="mt-3 flex items-center space-x-2 text-green-300">
                <Zap className="w-4 h-4" />
                <span className="text-sm">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics - New Card Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Assets Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                +12%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{mockMetrics.totalAssets.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-600">Total Assets</p>
            </div>
          </div>
        </div>

        {/* Active Assets Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                +8%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{mockMetrics.activeAssets.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-600">Active Assets</p>
            </div>
          </div>
        </div>

        {/* Total Value Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                +5%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">${(mockMetrics.totalValue / 1000000).toFixed(1)}M</p>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
            </div>
          </div>
        </div>

        {/* Monthly Maintenance Cost Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                -2.1%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">${(mockMetrics.monthlyMaintenanceCost / 1000).toFixed(1)}K</p>
              <p className="text-sm font-medium text-slate-600">Monthly Maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Alert Metrics - Hexagonal Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-900">{mockMetrics.pendingAudits}</p>
                <p className="text-sm font-medium text-amber-700">Pending Audits</p>
              </div>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-900">{mockMetrics.overdueAudits}</p>
                <p className="text-sm font-medium text-red-700">Overdue Audits</p>
              </div>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">{mockMetrics.maintenanceRequired}</p>
                <p className="text-sm font-medium text-blue-700">Maintenance Required</p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Filters
          category={category}
          branch={branch}
          status={status}
          onCategoryChange={setCategory}
          onBranchChange={setBranch}
          onStatusChange={setStatus}
        />
      </div>

      {/* Lifecycle Metrics */}
      <div className="mb-8">
        <LifecycleMetrics lifecycle={filteredData.lifecycle} />
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard
          title="Asset Distribution"
          icon={<PieChart className="w-5 h-5 text-blue-600" />}
          chartConfig={assetStateConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
        <ChartCard
          title="Maintenance Cost Trend"
          icon={<Wrench className="w-5 h-5 text-red-600" />}
          chartConfig={maintenanceCostConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Branch Activity"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          chartConfig={ownershipChangesConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
        <ChartCard
          title="Depreciation Analysis"
          icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          chartConfig={depreciationConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
      </div>

      {/* Enhanced Quick Actions Panel */}
      <div className="mt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300/10 rounded-full -translate-y-32 -translate-x-32"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-300/10 rounded-full translate-y-24 translate-x-24"></div>
        
        <div className="relative">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span>Quick Actions</span>
          </h2>
          <p className="text-slate-600 mb-8">Streamline your workflow with these essential tools</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button className="relative w-full bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl group">
                <Package className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-bold text-slate-900 mb-2">Add Asset</h3>
                <p className="text-sm text-slate-600">Register new equipment</p>
                <div className="absolute top-4 right-4">
                  <Star className="w-4 h-4 text-blue-400" />
                </div>
              </button>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button className="relative w-full bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl group">
                <ClipboardCheck className="w-10 h-10 text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-bold text-slate-900 mb-2">Start Audit</h3>
                <p className="text-sm text-slate-600">Begin asset verification</p>
                <div className="absolute top-4 right-4">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </button>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button className="relative w-full bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl group">
                <Users className="w-10 h-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-bold text-slate-900 mb-2">Assign Assets</h3>
                <p className="text-sm text-slate-600">Manage assignments</p>
                <div className="absolute top-4 right-4">
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
              </button>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button className="relative w-full bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl group">
                <BarChart3 className="w-10 h-10 text-amber-600 mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-bold text-slate-900 mb-2">View Reports</h3>
                <p className="text-sm text-slate-600">Generate analytics</p>
                <div className="absolute top-4 right-4">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}