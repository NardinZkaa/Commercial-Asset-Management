import { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, DollarSign, Calendar, TrendingDown } from 'lucide-react';
import { ChartConfiguration } from 'chart.js/auto';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('12months');

  // Sample analytics data
  const assetValueTrendConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Asset Value ($M)',
        data: [2.1, 2.3, 2.2, 2.4, 2.6, 2.5, 2.7, 2.8, 2.6, 2.9, 3.0, 2.9],
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
        y: {
          beginAtZero: false,
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

  const categoryDistributionConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: ['Electronics', 'Furniture', 'Vehicles', 'Equipment'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
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
          tension: 0.4
        },
        {
          label: 'Furniture',
          data: [100, 85, 70, 60, 50],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Vehicles',
          data: [100, 70, 50, 35, 25],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
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
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Maintenance Costs ($K)',
        data: [8.2, 12.5, 9.8, 15.2, 11.3, 7.9],
        backgroundColor: '#ef4444',
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

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-slate-300 mt-1">Advanced insights and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="24months">Last 24 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="ROI Performance"
          value="23.5%"
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: true }}
          color="green"
        />
        <MetricCard
          title="Cost Savings"
          value="$125K"
          icon={DollarSign}
          trend={{ value: 12.8, isPositive: true }}
          color="blue"
        />
        <MetricCard
          title="Avg Asset Lifespan"
          value="4.2 years"
          icon={Calendar}
          trend={{ value: 8.1, isPositive: true }}
          color="purple"
        />
        <MetricCard
          title="Depreciation Rate"
          value="18.5%"
          icon={TrendingDown}
          trend={{ value: -2.3, isPositive: true }}
          color="red"
        />
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Asset Value"
          value="$2.9M"
          icon={DollarSign}
          trend={{ value: 15.3, isPositive: true }}
          color="blue"
          className="md:col-span-1"
        />
        <MetricCard
          title="Monthly Depreciation"
          value="$12.5K"
          icon={TrendingDown}
          trend={{ value: -2.1, isPositive: false }}
          color="yellow"
          className="md:col-span-1"
        />
        <MetricCard
          title="Maintenance Costs"
          value="$8.2K"
          icon={Activity}
          trend={{ value: -5.7, isPositive: true }}
          color="green"
          className="md:col-span-1"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard
          title="Asset Value Trend"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          chartConfig={assetValueTrendConfig}
        />
        <ChartCard
          title="Category Distribution"
          icon={<PieChart className="w-5 h-5 text-blue-600" />}
          chartConfig={categoryDistributionConfig}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Depreciation Curves"
          icon={<TrendingDown className="w-5 h-5 text-blue-600" />}
          chartConfig={depreciationConfig}
        />
        <ChartCard
          title="Maintenance Costs"
          icon={<Activity className="w-5 h-5 text-blue-600" />}
          chartConfig={maintenanceCostConfig}
        />
      </div>

      {/* Insights Panel */}
      <div className="mt-8 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900">Performance</h3>
            </div>
            <p className="text-sm text-blue-800">
              Asset value has increased by 15% this quarter, with electronics showing the strongest performance.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-emerald-900">Cost Optimization</h3>
            </div>
            <p className="text-sm text-emerald-800">
              Preventive maintenance programs have reduced unexpected repair costs by 35% year-over-year.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-amber-900">Depreciation</h3>
            </div>
            <p className="text-sm text-amber-800">
              Electronics depreciate fastest at 25% annually, while furniture maintains value better at 15% annually.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}