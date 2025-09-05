import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  Target,
  Star,
  Calendar,
  RefreshCw,
  Filter,
  Download,
  Bell,
  Settings,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ChartConfiguration } from 'chart.js/auto';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { mockAssets, mockMaintenanceRequests, mockUsers } from '../data/mockMainData';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'alert';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
  config?: any;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

export default function EnhancedDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Warranty Expiring Soon',
      message: '5 assets have warranties expiring within 30 days',
      timestamp: new Date().toISOString(),
      actionRequired: true
    },
    {
      id: 'alert-2',
      type: 'error',
      title: 'Overdue Maintenance',
      message: '3 maintenance requests are overdue',
      timestamp: new Date().toISOString(),
      actionRequired: true
    },
    {
      id: 'alert-3',
      type: 'info',
      title: 'Monthly Report Ready',
      message: 'January asset report is ready for download',
      timestamp: new Date().toISOString(),
      actionRequired: false
    }
  ]);

  // Calculate real-time metrics
  const totalAssets = mockAssets.length;
  const activeAssets = mockAssets.filter(a => a.status === 'Active').length;
  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const maintenanceRequests = mockMaintenanceRequests.length;
  const pendingRequests = mockMaintenanceRequests.filter(r => r.status === 'pending').length;
  const completedRequests = mockMaintenanceRequests.filter(r => r.status === 'completed').length;
  const utilizationRate = Math.round((activeAssets / totalAssets) * 100);

  // Advanced metrics
  const avgAssetValue = totalValue / totalAssets;
  const monthlyDepreciation = mockAssets.reduce((sum, asset) => {
    const age = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const annualDepreciation = (asset.purchasePrice - asset.currentValue) / Math.max(age, 1);
    return sum + (annualDepreciation / 12);
  }, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  // Chart configurations
  const assetTrendConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Asset Count',
        data: [145, 152, 148, 156, 162, 158],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false, grid: { color: '#e2e8f0' } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  };

  const maintenanceCostConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Hardware', 'Software', 'Network', 'Other'],
      datasets: [{
        label: 'Cost ($)',
        data: [12500, 3200, 8900, 2100],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#6366f1'],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  };

  const utilizationConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Inactive', 'Maintenance', 'Retired'],
      datasets: [{
        data: [activeAssets, totalAssets - activeAssets - 8 - 3, 8, 3],
        backgroundColor: ['#10b981', '#6b7280', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20, usePointStyle: true, font: { size: 12 } }
        }
      }
    }
  };

  return (
    <>
      {/* Enhanced Header with Real-time Status */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Executive Dashboard</h1>
                <p className="text-blue-200 text-lg">Real-time asset intelligence and performance metrics</p>
                <div className="flex items-center space-x-6 mt-3 text-sm text-blue-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Real-time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-slate-800/50 border border-slate-600 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.filter(a => a.actionRequired).length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Action Required</h3>
                <p className="text-amber-700">
                  {alerts.filter(a => a.actionRequired).length} items need your attention
                </p>
              </div>
            </div>
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200">
              View All
            </button>
          </div>
        </div>
      )}

      {/* Enhanced KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 text-sm font-medium">
                <ArrowUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{totalAssets.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-600">Total Assets</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 text-sm font-medium">
                <ArrowUp className="w-4 h-4" />
                <span>+8%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{utilizationRate}%</p>
              <p className="text-sm font-medium text-slate-600">Utilization Rate</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${utilizationRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 text-sm font-medium">
                <ArrowUp className="w-4 h-4" />
                <span>+15%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">${(totalValue / 1000000).toFixed(1)}M</p>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 text-sm font-medium">
                <ArrowDown className="w-4 h-4" />
                <span>-5%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">${(monthlyDepreciation / 1000).toFixed(1)}K</p>
              <p className="text-sm font-medium text-slate-600">Monthly Depreciation</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">${avgAssetValue.toLocaleString()}</p>
              <p className="text-sm font-medium text-blue-700">Avg Asset Value</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">Performance</span>
            <div className="flex items-center space-x-1 text-emerald-600">
              <ArrowUp className="w-3 h-3" />
              <span className="font-medium">+18%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">94%</p>
              <p className="text-sm font-medium text-emerald-700">Compliance Score</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-700">Audit Rating</span>
            <div className="flex items-center space-x-1 text-emerald-600">
              <ArrowUp className="w-3 h-3" />
              <span className="font-medium">+3%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">98.5%</p>
              <p className="text-sm font-medium text-purple-700">System Uptime</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700">Availability</span>
            <div className="flex items-center space-x-1 text-emerald-600">
              <ArrowUp className="w-3 h-3" />
              <span className="font-medium">+0.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">System Alerts</h2>
          </div>
          <button className="text-slate-600 hover:text-slate-800 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`border-2 rounded-xl p-4 ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {alert.actionRequired && (
                  <button className="text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    Action
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <ChartCard
          title="Asset Growth Trend"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          chartConfig={assetTrendConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
        
        <ChartCard
          title="Maintenance Costs by Category"
          icon={<BarChart3 className="w-5 h-5 text-red-600" />}
          chartConfig={maintenanceCostConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
        
        <ChartCard
          title="Asset Utilization"
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          chartConfig={utilizationConfig}
          className="transform hover:scale-[1.02] transition-all duration-300"
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Maintenance Efficiency"
          value="87%"
          icon={Settings}
          trend={{ value: 5.2, isPositive: true }}
          color="green"
        />
        <MetricCard
          title="Cost Optimization"
          value="$125K"
          icon={DollarSign}
          trend={{ value: 12.8, isPositive: true }}
          color="blue"
        />
        <MetricCard
          title="Asset Lifecycle"
          value="4.2 years"
          icon={Calendar}
          trend={{ value: 8.1, isPositive: true }}
          color="purple"
        />
        <MetricCard
          title="ROI Performance"
          value="23.5%"
          icon={TrendingUp}
          trend={{ value: 3.7, isPositive: true }}
          color="green"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            </div>
            <button className="text-slate-600 hover:text-slate-800 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: Package, text: 'New asset registered: MacBook Pro 16"', time: '2 minutes ago', color: 'text-blue-600' },
              { icon: CheckCircle, text: 'Maintenance completed: Dell Monitor repair', time: '15 minutes ago', color: 'text-emerald-600' },
              { icon: Users, text: 'Asset assigned to Sarah Johnson', time: '1 hour ago', color: 'text-purple-600' },
              { icon: AlertTriangle, text: 'Warranty expiring: iPhone 14 Pro', time: '2 hours ago', color: 'text-amber-600' },
              { icon: TrendingUp, text: 'Monthly report generated', time: '3 hours ago', color: 'text-indigo-600' }
            ].map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <IconComponent className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, label: 'Add Asset', color: 'from-blue-500 to-blue-600', hoverColor: 'hover:from-blue-600 hover:to-blue-700' },
              { icon: Users, label: 'Assign Asset', color: 'from-emerald-500 to-emerald-600', hoverColor: 'hover:from-emerald-600 hover:to-emerald-700' },
              { icon: ClipboardCheck, label: 'Start Audit', color: 'from-purple-500 to-purple-600', hoverColor: 'hover:from-purple-600 hover:to-purple-700' },
              { icon: FileText, label: 'Generate Report', color: 'from-amber-500 to-amber-600', hoverColor: 'hover:from-amber-600 hover:to-amber-700' }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  className={`group relative bg-gradient-to-br ${action.color} ${action.hoverColor} text-white p-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <IconComponent className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}