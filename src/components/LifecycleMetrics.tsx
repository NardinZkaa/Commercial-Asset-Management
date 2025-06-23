import { Activity, Settings, XCircle, Clock } from 'lucide-react';
import { Lifecycle } from '../types/dashboard';

interface LifecycleMetricsProps {
  lifecycle: Lifecycle;
}

export default function LifecycleMetrics({ lifecycle }: LifecycleMetricsProps) {
  const metrics = [
    {
      icon: Activity,
      value: `${lifecycle.inUse}%`,
      label: 'In Use',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      icon: Settings,
      value: `${lifecycle.underMaintenance}%`,
      label: 'Under Maintenance',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      icon: XCircle,
      value: `${lifecycle.retired}%`,
      label: 'Retired',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">Asset Lifecycle</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.bgColor} ${metric.borderColor} border-2 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-6 h-6 ${metric.color}`} />
                <span className={`text-2xl font-bold ${metric.color} group-hover:scale-110 transition-transform duration-200`}>
                  {metric.value}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
            </div>
          );
        })}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-2 inline-flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Average Lifespan: <span className="font-semibold text-slate-900">{lifecycle.avgLifespanYears} Years</span></span>
        </p>
      </div>
    </div>
  );
}