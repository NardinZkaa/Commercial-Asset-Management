import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  className = '' 
}: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-200',
    green: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-200',
    yellow: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50 border-amber-200',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50 border-red-200',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-200'
  };

  const [gradientClass, textClass, bgClass, borderClass] = colorClasses[color].split(' ');

  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-600">{title}</p>
      </div>
    </div>
  );
}